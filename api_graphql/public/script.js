
function fillEditForm(product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductValue').value = product.value;
}           

async function fetchProducts() {
    const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
                {
                products {
                    id
                    name
                    value
                }
                }
            `,
        }),
    });

    if (!response.ok) {
        console.error('Error en la solicitud GraphQL:', response.statusText);
        return;
    }

    const data = await response.json();
    console.log(data);
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    data.data.products.forEach(product => {
        const li = document.createElement('li');
        li.textContent = `ID: ${product.id}, Nombre: ${product.name}, Valor: $${product.value} `;
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Modificar';
        editButton.onclick = () => fillEditForm(product);
        li.appendChild(editButton);

        productList.appendChild(li);
    });
}

async function addProduct() {
    const productName = document.getElementById('productName').value;
    const productValue = parseFloat(document.getElementById('productValue').value);

    if (!productName || isNaN(productValue)) {
        alert('Ingresa un nombre y un valor válido.');
        return;
    }

    const escapedProductName = productName.replace(/"/g, '\\"');
    const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        query: `
            mutation {
                addProduct(name: "${escapedProductName}", value: ${productValue}) {
                    id
                    name
                    value
                }
            }
        `,
        }),
    });
    await fetchProducts();

    document.getElementById('productName').value = '';
    document.getElementById('productValue').value = '';
}

async function updateProduct() {
    const id = document.getElementById('productId').value;
    const name = document.getElementById('editProductName').value;
    const value = parseFloat(document.getElementById('editProductValue').value);

    if (!name || name ==="" || isNaN(value)) {
        alert('Ingresa un nombre y un valor válido.');
        return;
    }

    const escapedName = name.replace(/"/g, '\\"');

    const response = await fetch('http://localhost:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                mutation {
                    updateProduct(id: "${id}", name: "${escapedName}", value: ${value}) {
                        id
                        name
                        value
                        }
                    }
                `
        })
    });

    await fetchProducts();

    document.getElementById('productId').value = '';
    document.getElementById('editProductName').value = '';
    document.getElementById('editProductValue').value = '';
}
