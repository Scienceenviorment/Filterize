def log_message(message):
    """Logs a message to the console."""
    print(f"[LOG] {message}")

def load_config(config_file):
    """Loads configuration from a given file."""
    import json
    with open(config_file, 'r') as file:
        config = json.load(file)
    return config

def save_results(results, output_file):
    """Saves results to a specified output file."""
    with open(output_file, 'w') as file:
        file.write(results)