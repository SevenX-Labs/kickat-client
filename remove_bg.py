from PIL import Image

def remove_background(input_path, output_path, bg_color, threshold=40):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        r, g, b = item[:3]
        # Calculate distance
        dist = ((r - bg_color[0])**2 + (g - bg_color[1])**2 + (b - bg_color[2])**2)**0.5
        
        if dist < threshold:
            alpha = int(255 * (dist / threshold)**1.5)
            new_data.append((r, g, b, alpha))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

remove_background('public/logo.png', 'public/logo-clean.png', (245, 249, 252), 25)
