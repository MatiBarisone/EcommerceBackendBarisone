const socket = io()

//Actualiza la lista eliminando el producto de la tabla (desde cualquier lado)
socket.on("deleteProduct", producto => {
    const filas = document.querySelectorAll("#products tr");
    filas.forEach(fila => {
        const idCelda = fila.querySelector("td");
        if (idCelda && idCelda.textContent === producto.pid.toString()) {
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
    id.textContent = nuevoProducto.pid;
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

    eliminar.addEventListener('click', () => eliminarProducto(nuevoProducto.pid, fila));
    
    td.appendChild(eliminar);
    fila.appendChild(td);
    
    tbody.appendChild(fila);
})

//Este se encarga de cargar los productos en la pagina "realTimeProducts"
const cargarProductos = async () => {
    let respuesta = await fetch("/api/products");
    let { productos } = await respuesta.json();

    const tbody = document.getElementById("products"); // Selecciona el elemento donde se añadirán las filas

    productos.forEach(p => {
        let fila = document.createElement("tr"); // Crea una fila para cada producto
        
        // Crea una celda para cada propiedad del producto y la añade a la fila
        let id = document.createElement("td");
        id.textContent = p.pid;
        fila.appendChild(id);
        
        let nombre = document.createElement("td");
        nombre.textContent = p.title;
        fila.appendChild(nombre);
        
        let descripcion = document.createElement("td");
        descripcion.textContent = p.description;
        fila.appendChild(descripcion);
        
        let codigo = document.createElement("td");
        codigo.textContent = p.code;
        fila.appendChild(codigo);
        
        let precio = document.createElement("td");
        precio.textContent = `$${p.price}`;
        fila.appendChild(precio);
        
        let stock = document.createElement("td");
        stock.textContent = p.stock;
        fila.appendChild(stock);
        
        let categoria = document.createElement("td");
        categoria.textContent = p.category;
        fila.appendChild(categoria);

        let td = document.createElement("td");
        let eliminar = document.createElement("button");
        eliminar.textContent = "Eliminar";

        eliminar.addEventListener('click', () => eliminarProducto(p.pid, fila));
        
        td.appendChild(eliminar);
        fila.appendChild(td);

        tbody.appendChild(fila); // Añade la fila completa al tbody
    });
};
cargarProductos();

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



//Este se encarga de cargar los productos en la pagina "index"
const cargarProductosEstaticos = async () => {
    let respuesta = await fetch("/api/products");
    let { productos } = await respuesta.json();

    const tbody = document.getElementById("productsEstaticos"); // Selecciona el elemento donde se añadirán las filas

    productos.forEach(p => {
        let fila = document.createElement("tr"); // Crea una fila para cada producto
        
        // Crea una celda para cada propiedad del producto y la añade a la fila
        let id = document.createElement("td");
        id.textContent = p.pid;
        fila.appendChild(id);
        
        let nombre = document.createElement("td");
        nombre.textContent = p.title;
        fila.appendChild(nombre);
        
        let descripcion = document.createElement("td");
        descripcion.textContent = p.description;
        fila.appendChild(descripcion);
        
        let codigo = document.createElement("td");
        codigo.textContent = p.code;
        fila.appendChild(codigo);
        
        let precio = document.createElement("td");
        precio.textContent = `$${p.price}`;
        fila.appendChild(precio);
        
        let stock = document.createElement("td");
        stock.textContent = p.stock;
        fila.appendChild(stock);
        
        let categoria = document.createElement("td");
        categoria.textContent = p.category;
        fila.appendChild(categoria);
        
        tbody.appendChild(fila); // Añade la fila completa al tbody
    });
}
cargarProductosEstaticos()

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