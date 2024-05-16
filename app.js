document.addEventListener("DOMContentLoaded", () => {
  const listaCompras = document.getElementById("listaCompras");
  const btnGuardar = document.getElementById("btnGuardar");
  const btnAgregarProducto = document.getElementById("btnAgregarProducto");
  const listasGuardadasContainer = document.getElementById("listasGuardadas");
  const modalModificar = document.getElementById("modalModificar");
  const modalEliminar = document.getElementById("modalEliminar");
  const btnCerrarModificar = document.getElementById("btnCerrarModificar");
  const btnCerrarEliminar = document.getElementById("btnCerrarEliminar");
  const btnConfirmarModificar = document.getElementById(
    "btnConfirmarModificar"
  );
  const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

  let listaAModificar = null;

  //Cargar productos por categoria

  function cargarProductos() {
    fetch(("/data.json"))
      .then((response) => response.json())
      .then((data) => {
        listaCompras.innerHTML = "";

        for (const categoria in data.productos[0]) {
          if (data.productos[0].hasOwnProperty(categoria)) {
            const categoriaContainer = document.createElement("div");
            categoriaContainer.classList.add("categoria-container");

            const categoriaTitulo = document.createElement("h3");
            categoriaTitulo.textContent =
              categoria.charAt(0).toUpperCase() + categoria.slice(1);

            categoriaContainer.appendChild(categoriaTitulo);

            const productosContainer = document.createElement("div");
            productosContainer.classList.add("productos-categoria");

            const productosCategoria = data.productos[0][categoria];

            productosCategoria.forEach((producto) => {
              const nuevoElemento = crearElementoLista(
                producto.nombre,
                producto.id
              );
              productosContainer.appendChild(nuevoElemento);
            });

            categoriaContainer.appendChild(productosContainer);

            listaCompras.appendChild(categoriaContainer);
          }
        }
      })
      .catch((error) => console.error("Error al cargar los productos:", error));
  }

  cargarProductos();

  // Botones

  btnAgregarProducto.addEventListener("click", () => {
    const producto = prompt("Ingrese el nombre del producto:");
    if (producto) {
      const nuevoElemento = crearElementoLista(producto, null);
      listaCompras.appendChild(nuevoElemento);
    }
  });

  btnGuardar.addEventListener("click", () => {
    const nombreLista = prompt("Ingrese el nombre de la lista:");
    if (nombreLista) {
      const productosSeleccionados = listaCompras.querySelectorAll(
        "input[type='checkbox']:checked"
      );

      if (productosSeleccionados.length > 0) {
        const listaProductos = [];
        productosSeleccionados.forEach((producto) => {
          listaProductos.push({
            nombre: producto.nextSibling.textContent,
            id: producto.value,
          });
        });

        fetch("https://lista-compras-33.netlify.app/listas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: nombreLista,
            productos: listaProductos,
          }),
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Error al guardar la lista");
            }
          })
          .then((data) => {
            alert("Lista guardada correctamente");
            cargarListasGuardadas();
            limpiarSeleccion();
          })
          .catch((error) => console.error(error));
      } else {
        alert("Por favor, selecciona al menos un producto para guardar.");
      }
    }
  });

  function crearElementoLista(nombre, id) {
    const contenedor = document.createElement("div");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = id;

    const label = document.createElement("label");
    label.textContent = nombre;

    contenedor.appendChild(checkbox);
    contenedor.appendChild(label);

    return contenedor;
  }

  function cargarListasGuardadas() {
    fetch("https://lista-compras-33.netlify.app/listas")
      .then((response) => response.json())
      .then((data) => {
        listasGuardadasContainer.innerHTML = "";

        data.forEach((lista, index) => {
          const listaElemento = document.createElement("div");
          listaElemento.classList.add("lista-guardada");
          listaElemento.innerHTML = `<h3>Lista ${index + 1}: ${
            lista.nombre
          }</h3>`;
          lista.productos.forEach((producto) => {
            const productoElemento = document.createElement("p");
            productoElemento.textContent = producto.nombre;
            listaElemento.appendChild(productoElemento);
          });

          const btnEliminar = document.createElement("button");
          btnEliminar.textContent = "Eliminar";
          btnEliminar.addEventListener("click", () => {
            mostrarModalEliminar(lista.id, lista.nombre);
          });
          listaElemento.appendChild(btnEliminar);

          const btnModificar = document.createElement("button");
          btnModificar.textContent = "Modificar";
          btnModificar.addEventListener("click", () => {
            mostrarModalModificar(lista, lista.nombre);
          });
          listaElemento.appendChild(btnModificar);

          listasGuardadasContainer.appendChild(listaElemento);
        });
      })
      .catch((error) =>
        console.error("Error al cargar las listas guardadas:", error)
      );
  }

  function limpiarSeleccion() {
    const productosSeleccionados = listaCompras.querySelectorAll(
      "input[type='checkbox']:checked"
    );
    productosSeleccionados.forEach((producto) => {
      producto.checked = false;
    });
  }

  function mostrarModalModificar(lista, nombreLista) {
    const modalModificarLista = document.getElementById("modalModificarLista");
    modalModificarLista.innerHTML = "";

    lista.productos.forEach((producto) => {
      const productoElemento = document.createElement("div");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      const label = document.createElement("label");
      label.textContent = producto.nombre;
      productoElemento.appendChild(checkbox);
      productoElemento.appendChild(label);
      modalModificarLista.appendChild(productoElemento);
    });

    const nombreListaElemento = document.createElement("p");
    nombreListaElemento.textContent = `Nombre de la lista: ${nombreLista}`;
    modalModificarLista.appendChild(nombreListaElemento);

    modalModificar.style.display = "block";

    listaAModificar = lista;
  }

  function mostrarModalEliminar(idLista, nombreLista) {
    const modalEliminarNombre = document.getElementById("modalEliminarNombre");
    modalEliminarNombre.textContent = `¿Seguro que desea eliminar la lista "${nombreLista}"?`;

    modalEliminar.style.display = "block";

    btnConfirmarEliminar.addEventListener("click", () => {
      eliminarLista(idLista);
    });
  }

  function eliminarLista(idLista) {
    fetch(`https://lista-compras-33.netlify.app/listas/${idLista}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          console.log("Lista eliminada correctamente");
          modalEliminar.style.display = "none";
          cargarListasGuardadas();
        } else {
          throw new Error("Error al eliminar la lista");
        }
      })
      .catch((error) => console.error("Error al eliminar la lista:", error));
  }

  btnCerrarModificar.addEventListener("click", () => {
    modalModificar.style.display = "none";
  });

  btnCerrarEliminar.addEventListener("click", () => {
    modalEliminar.style.display = "none";
  });

  btnConfirmarModificar.addEventListener("click", () => {
    const productosSeleccionados = modalModificar.querySelectorAll(
      "input[type='checkbox']:checked"
    );
    const listaProductos = [];
    productosSeleccionados.forEach((producto) => {
      listaProductos.push({ nombre: producto.nextSibling.textContent });
    });
    listaAModificar.productos = listaProductos;

    fetch(`https://lista-compras-33.netlify.app/${listaAModificar.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(listaAModificar),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Lista modificada correctamente");
          modalModificar.style.display = "none";
          cargarListasGuardadas();
        } else {
          throw new Error("Error al modificar la lista");
        }
      })
      .catch((error) => console.error("Error al modificar la lista:", error));
  });

  cargarListasGuardadas();
});
