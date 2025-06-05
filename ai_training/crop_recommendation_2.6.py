import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt
import os

# 1. Cargar y preprocesar datos
df = pd.read_csv('Crop_recommendation.csv')
X = df.drop('label', axis=1).values.astype(np.float32)
y = df['label'].values
labels, y_enc = np.unique(y, return_inverse=True)

# Normalización manual
X_mean = X.mean(axis=0)
X_std = X.std(axis=0)
X_scaled = (X - X_mean) / X_std

# Mezclar y separar
indices = np.arange(len(X_scaled))
np.random.shuffle(indices)
X_scaled = X_scaled[indices]
y_enc = y_enc[indices]
N = int(0.8 * len(X_scaled))
X_train, X_val = X_scaled[:N], X_scaled[N:]
y_train, y_val = y_enc[:N], y_enc[N:]

# Tensores
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
X_train_t = torch.tensor(X_train, dtype=torch.float32).to(device)
X_val_t = torch.tensor(X_val, dtype=torch.float32).to(device)
y_train_t = torch.tensor(y_train, dtype=torch.long).to(device)
y_val_t = torch.tensor(y_val, dtype=torch.long).to(device)

# 2. Definir arquitecturas de modelos
print("\nEntrenando y comparando tres arquitecturas:")
print("MLP1: 1 capa oculta (64 neuronas)")
print("MLP2: 2 capas ocultas (128 y 64 neuronas)")
print("MLP3: 3 capas ocultas (256, 128 y 64 neuronas)\n")

class MLP1(nn.Module):
    def __init__(self, in_dim, out_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, 64),
            nn.ReLU(),
            nn.Linear(64, out_dim)
        )
    def forward(self, x): return self.net(x)

class MLP2(nn.Module):
    def __init__(self, in_dim, out_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, out_dim)
        )
    def forward(self, x): return self.net(x)

class MLP3(nn.Module):
    def __init__(self, in_dim, out_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, out_dim)
        )
    def forward(self, x): return self.net(x)

models = {
    "MLP1": MLP1(X_train.shape[1], len(labels)).to(device),
    "MLP2": MLP2(X_train.shape[1], len(labels)).to(device),
    "MLP3": MLP3(X_train.shape[1], len(labels)).to(device)
}

# 3. Entrenamiento y registro de métricas
history = {}
epochs = 30
for name, model in models.items():
    optimizer = optim.Adam(model.parameters(), lr=0.01)
    criterion = nn.CrossEntropyLoss()
    train_losses, val_losses, train_accs, val_accs = [], [], [], []
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        out = model(X_train_t)
        loss = criterion(out, y_train_t)
        loss.backward()
        optimizer.step()
        train_losses.append(loss.item())
        train_accs.append((out.argmax(1) == y_train_t).float().mean().item())

        model.eval()
        with torch.no_grad():
            val_out = model(X_val_t)
            val_loss = criterion(val_out, y_val_t)
            val_losses.append(val_loss.item())
            val_accs.append((val_out.argmax(1) == y_val_t).float().mean().item())
        
        # Mostrar progreso en porcentaje
        progress = int(100 * (epoch + 1) / epochs)
        print(f"\rEntrenando {name}: {progress}% completado", end="", flush=True)
    print()  # Salto de línea al terminar cada modelo
    history[name] = {
        "train_loss": train_losses,
        "val_loss": val_losses,
        "train_acc": train_accs,
        "val_acc": val_accs,
        "model": model
    }

# 4. Graficar curvas de pérdida y precisión
plt.figure(figsize=(14, 5))
for name in models:
    plt.plot(history[name]["train_loss"], label=f'{name} Train Loss')
    plt.plot(history[name]["val_loss"], label=f'{name} Val Loss', linestyle='--')
plt.title('Curvas de Pérdida (Log Loss) por Modelo')
plt.xlabel('Época')
plt.ylabel('Log Loss')
plt.legend()
plt.grid(True)
plt.tight_layout()

plt.figure(figsize=(14, 5))
for name in models:
    plt.plot(history[name]["train_acc"], label=f'{name} Train Accuracy')
    plt.plot(history[name]["val_acc"], label=f'{name} Val Accuracy', linestyle='--')
plt.title('Curvas de Precisión (Accuracy) por Modelo')
plt.xlabel('Época')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True)
plt.tight_layout()

# 6. Función de inferencia
def infer(vector, model_name="MLP1"):
    vector = np.array(vector, dtype=np.float32)
    vector_scaled = (vector - X_mean) / X_std
    vector_t = torch.from_numpy(vector_scaled.reshape(1, -1)).float().to(device)
    model = history[model_name]["model"]
    model.eval()
    with torch.no_grad():
        pred = model(vector_t).argmax(1).item()
        label = labels[pred]
    return label

# Guardar los tres modelos entrenados
torch.save(history["MLP1"]["model"].state_dict(), "mlp1_trained.pth")
torch.save(history["MLP2"]["model"].state_dict(), "mlp2_trained.pth")
torch.save(history["MLP3"]["model"].state_dict(), "mlp3_trained.pth")
print("\nModelos guardados: mlp1_trained.pth, mlp2_trained.pth, mlp3_trained.pth")

# Selección automática del modelo más eficiente (mayor accuracy, menor loss en caso de empate)
best_model_name = max(
    history,
    key=lambda name: (history[name]['val_acc'][-1], -history[name]['val_loss'][-1])
)
print(f"\nEl modelo más eficiente es: {best_model_name} (Accuracy: {history[best_model_name]['val_acc'][-1]:.4f}, Loss: {history[best_model_name]['val_loss'][-1]:.4f})")

# Guardar el nombre y la ruta absoluta del mejor modelo entrenado en un archivo txt
best_model_filename = f"{best_model_name.lower()}_trained.pth"
best_model_path = os.path.abspath(best_model_filename)
with open("best_model.txt", "w") as f:
    f.write(f"{best_model_path}\n")

print(f"Se guardo la ubicación dentro de: 'best_model.txt'")

# Crear carpeta para guardar las gráficas si no existe
os.makedirs("gen_graphs", exist_ok=True)

# Guardar la gráfica de pérdida
plt.figure(figsize=(14, 5))
for name in models:
    plt.plot(history[name]["train_loss"], label=f'{name} Train Loss')
    plt.plot(history[name]["val_loss"], label=f'{name} Val Loss', linestyle='--')
plt.title('Curvas de Pérdida (Log Loss) por Modelo')
plt.xlabel('Época')
plt.ylabel('Log Loss')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig("gen_graphs/curvas_perdida.png")

# Guardar la gráfica de precisión
plt.figure(figsize=(14, 5))
for name in models:
    plt.plot(history[name]["train_acc"], label=f'{name} Train Accuracy')
    plt.plot(history[name]["val_acc"], label=f'{name} Val Accuracy', linestyle='--')
plt.title('Curvas de Precisión (Accuracy) por Modelo')
plt.xlabel('Época')
plt.ylabel('Accuracy')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.savefig("gen_graphs/curvas_accuracy.png")

# Mostrar la ruta absoluta de la carpeta de gráficas
graphs_dir = os.path.abspath("gen_graphs")
print(f"\nLas gráficas se guardaron en: {graphs_dir}")