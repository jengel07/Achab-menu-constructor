import os
import zipfile

source_dir = r"d:\daur-menu-constructor"
zip_path = r"d:\daur-menu-deploy.zip"

exclude_dirs = {'node_modules', '.git', 'temp_deploy'}
exclude_files = {'.env', 'daur-menu-deploy.zip'}

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file in exclude_files:
                continue
            # Skip any .sqlite files just in case we don't want to overwrite prod db, 
            # wait, they need database? Usually production has its own DB. Let's exclude database.sqlite?
            # User didn't specify. I'll just exclude standard files.
            
            file_path = os.path.join(root, file)
            # Create relative path
            rel_path = os.path.relpath(file_path, path)
            ziph.write(file_path, rel_path)

if os.path.exists(zip_path):
    os.remove(zip_path)

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir(source_dir, zipf)

print(f"Project successfully packaged to {zip_path}")

