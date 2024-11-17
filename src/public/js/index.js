const socket = io()

//Actualiza la lista eliminando el producto de la tabla (desde cualquier lado)
socket.on("deleteProduct", producto => {
    const filas = document.querySelectorAll("#products tr");
    filas.forEach(fila => {
        const idCelda = fila.querySelector("td");
        if (idCelda && idCelda.textContent == producto._id.toString()) {
            fila.remove();
        }
    });
});

//Actualiza la lista con el nuevo producto que se ingreso (desde cualquier lado)
socket.on("newProduct", nuevoProducto => {
    const tbody = document.getElementById("products");

    let fila = document.createElement("tr");
        
    // Crea una celda para cada propiedad del producto y la añade a la fila
    let id = document.createElement("td");
    id.textContent = nuevoProducto._id;
    fila.appendChild(id);
    
    let nombre = document.createElement("td");
    nombre.textContent = nuevoProducto.title;
    fila.appendChild(nombre);
    
    let descripcion = document.createElement("td");
    descripcion.textContent = nuevoProducto.description;
    fila.appendChild(descripcion);
    
    let codigo = document.createElement("td");
    codigo.textContent = nuevoProducto.code;
    fila.appendChild(codigo);
    
    let precio = document.createElement("td");
    precio.textContent = `$${nuevoProducto.price}`;
    fila.appendChild(precio);
    
    let stock = document.createElement("td");
    stock.textContent = nuevoProducto.stock;
    fila.appendChild(stock);
    
    let categoria = document.createElement("td");
    categoria.textContent = nuevoProducto.category;
    fila.appendChild(categoria);

    let td = document.createElement("td");
    let eliminar = document.createElement("button");
    eliminar.textContent = "Eliminar";

    eliminar.addEventListener('click', () => eliminarProducto(nuevoProducto._id, fila));
    
    td.appendChild(eliminar);
    fila.appendChild(td);
    
    tbody.appendChild(fila);
})


//Me permite usar el boton eliminar y llamar a la base de datos para eliminar el producto:
const eliminarProducto = async (productoId, fila) => {
    try {
        const response = await fetch(`/api/products/${productoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const result = await response.json();
            alert(`Error al eliminar el producto: ${result.error}`);
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        alert('Hubo un problema al eliminar el producto.');
    }
};

//Ayuda al usaurio a generar un carrito
const generarCarrito = async () => {
    try {
        // Realiza la solicitud POST para crear un nuevo carrito
        const response = await fetch('/api/carts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (response.ok) {
            const carritoId = result.nuevoCarrito._id;

            if (carritoId) {
                alert(`Carrito creado con éxito. ID del carrito: ${carritoId} - RECUERDA EL NUMERO`);
            } else {
                console.error('No se pudo obtener el ID del carrito:', result);
                alert('El carrito fue creado, pero no se pudo obtener el ID.');
            }
        } else {
            console.error('Error en la respuesta de la API:', result);
            alert(`Error al crear el carrito: ${result.error || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('Error al crear el carrito:', error);
        alert('Hubo un problema al crear el carrito.');
    }
};

//Añade el producto al carrito que determine el usuario
const añadirAlCarrito = async (productoId) => {
    // Solicita al usuario el ID del carrito
    const carritoId = prompt("Ingrese el ID del carrito al que desea añadir este producto:");

    // Si el usuario cancela o no ingresa un valor, no se hace nada
    if (!carritoId) {
        alert("Operación cancelada o ID de carrito no válido.");
        return;
    }

    try {
        // Realiza el POST a la API
        const response = await fetch(`/api/carts/${carritoId}/product/${productoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cantidad: 1 }) // Puedes ajustar la cantidad según sea necesario
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Producto añadido al carrito ID: ${carritoId} con éxito.`);
        } else {
            alert(`Error al añadir el producto al carrito: ${result.error || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('Error al añadir producto al carrito:', error);
        alert('Hubo un problema al añadir el producto al carrito.');
    }
};


//Ver que cuando se mande el form este todo bien
document.getElementById('productForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(event.target.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error al enviar el formulario:', error);
        alert('Hubo un problema al enviar el formulario.');
    }
});