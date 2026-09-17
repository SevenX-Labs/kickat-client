path = '/home/sahil-hode/Workspace/sevenx labs/kickat-ecommerce/kickat-client/src/components/shop/ProductDetail/ProductInfo.tsx'
with open(path, 'r') as f:
    content = f.read()

# Inspect if variants prop is handled in ProductInfo
target = '''export function ProductInfo({ product }: ProductInfoProps) {'''
# Let's read top of ProductInfo first
