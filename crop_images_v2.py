from PIL import Image
import os

comic_dir = 'src/assets/comic'

# Configuração de recorte para cada imagem
# As imagens são 1920x1080
# Remover header com "ARQUIVO DA FUGA" (topo ~15%) e rodapé com texto/botões (fundo ~45%)
crop_config = {
    'school.png': (0.14, 0.45),
    'abduction.png': (0.14, 0.45),
    'lab.png': (0.14, 0.45),
    'cell.png': (0.14, 0.45),
    'radio.png': (0.14, 0.45),
    'escape.png': (0.14, 0.45),
    'landing.png': (0.14, 0.45),
    'signal.png': (0.14, 0.45),
    'marcinho_final.png': (0.14, 0.45),
    'system_final.png': (0.14, 0.45),
}

for filename, (top_pct, bottom_pct) in crop_config.items():
    filepath = os.path.join(comic_dir, filename)
    img = Image.open(filepath)
    w, h = img.size
    
    top_px = int(h * top_pct)
    bottom_px = int(h * bottom_pct)
    
    if top_px + bottom_px >= h:
        print(f"SKIP {filename}: crop too large")
        continue
    
    cropped = img.crop((0, top_px, w, h - bottom_px))
    
    # Redimensionar de volta para 1920x1080
    resized = cropped.resize((w, h), Image.LANCZOS)
    resized.save(filepath)
    print(f"OK {filename}: {img.size} -> crop({top_px}, {h-bottom_px}) -> {resized.size}")

print("\nConcluído!")