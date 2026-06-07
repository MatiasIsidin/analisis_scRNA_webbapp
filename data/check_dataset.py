import pandas as pd
import os

path = "processed/synthetic_scRNA_pca.csv"
size = os.path.getsize(path)
print(f"Tamaño del archivo: {size:,} bytes  ({size/1024/1024:.1f} MB)")

df = pd.read_csv(path)
print(f"Shape: {df.shape}")
print(f"Columnas: {list(df.columns[:5])} ... {list(df.columns[-3:])}")
print(f"\nPrimeras 3 filas:")
print(df[["PC1","PC2","PC3","PC50","label"]].head(3).to_string())
print(f"\nDistribución de clases:")
print(df["label"].value_counts().to_string())
print(f"\nValores nulos: {df.isnull().sum().sum()}")
