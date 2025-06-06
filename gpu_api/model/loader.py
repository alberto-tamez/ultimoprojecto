import torch
import os
import logging
from model.definition import MLP3  # Importar la clase MLP3

# Configurar logging
logging.basicConfig(level=logging.INFO)

def get_model():
    ruta_txt = os.path.join(os.path.dirname(__file__), "../../ai_training/best_model.txt")

    # Leer la ruta del modelo
    try:
        with open(ruta_txt, "r") as f:
            model_path = f.read().strip()
        logging.info(f"[MODEL] Ruta del modelo cargada: {model_path}")
    except Exception as e:
        logging.error(f"[ERROR] No se pudo leer best_model.txt: {e}")
        raise

    # Instanciar el modelo usando la clase MLP3
    try:
        model = MLP3(7,22)
        logging.info("[MODEL] MLP3 instanciado con in_dim=7 y out_dim=22")
    except Exception as e:
        logging.error(f"[ERROR] Al instanciar MLP3: {e}")
        raise

    # Cargar pesos
    try:
        state_dict = torch.load(model_path, map_location=torch.device("cpu"))
        model.load_state_dict(state_dict)
        model.eval()
        logging.info("[MODEL] Pesos cargados correctamente y modelo en modo evaluación.")
    except Exception as e:
        logging.error(f"[ERROR] Al cargar los pesos del modelo: {e}")
        raise

    # Diccionario de clases
    label_map = {
    	0: "arroz",
    	1: "maíz",
    	2: "garbanzo",
    	3: "frijol rojo",
    	4: "gandul",
    	5: "frijol moth",
    	6: "frijol mungo",
    	7: "frijol negro",
    	8: "lenteja",
    	9: "granada",
    	10: "plátano",
    	11: "mango",
    	12: "uvas",
    	13: "sandía",
    	14: "melón",
    	15: "manzana",
    	16: "naranja",
   	17: "papaya",
    	18: "coco",
    	19: "algodón",
    	20: "yute",
    	21: "café"
	}	

    return model, label_map
