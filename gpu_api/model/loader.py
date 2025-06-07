import torch
import os
import logging
from model.definition import MLP3  # Importar la clase MLP3

# Configurar logging
logging.basicConfig(level=logging.INFO)

def get_model():
    # Use relative path from the project root
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    model_txt_path = os.path.join(project_root, "ai_training/best_model.txt")
    
    # Read the model path from the text file or use a default
    try:
        if os.path.exists(model_txt_path):
            with open(model_txt_path, "r") as f:
                model_path = f.read().strip()
            logging.info(f"[MODEL] Model path loaded: {model_path}")
        else:
            # If best_model.txt doesn't exist, use a default path
            model_path = os.path.join(project_root, "ai_training/mlp3_trained.pth")
            logging.info(f"[MODEL] Using default model path: {model_path}")
    except Exception as e:
        logging.error(f"[ERROR] Could not determine model path: {e}")
        # Use a fallback path instead of raising an exception
        model_path = os.path.join(project_root, "ai_training/mlp3_trained.pth")
        logging.warning(f"[WARNING] Using fallback model path: {model_path}")

    # Instanciar el modelo usando la clase MLP3
    try:
        model = MLP3(7,22)
        logging.info("[MODEL] MLP3 instanciado con in_dim=7 y out_dim=22")
    except Exception as e:
        logging.error(f"[ERROR] Al instanciar MLP3: {e}")
        raise

    # Load model weights if available, otherwise use a randomly initialized model
    try:
        if os.path.exists(model_path):
            state_dict = torch.load(model_path, map_location=torch.device("cpu"))
            model.load_state_dict(state_dict)
            logging.info("[MODEL] Weights loaded successfully")
        else:
            logging.warning(f"[WARNING] Model file not found at {model_path}. Using randomly initialized model.")
            # The model is already initialized with random weights, so we don't need to do anything else
        
        # Set model to evaluation mode
        model.eval()
        logging.info("[MODEL] Model set to evaluation mode")
    except Exception as e:
        logging.error(f"[ERROR] Error loading model weights: {e}")
        logging.warning("[WARNING] Using randomly initialized model for testing purposes")
        # Continue with the randomly initialized model instead of raising an exception

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
