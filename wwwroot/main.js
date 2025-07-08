import { initViewer, loadModel } from './viewer.js'; //importamos las funciones de viewer.js
import { initTree } from './sidebar.js'; //importamos las funciones de sidebar.js

const login = document.getElementById('login'); //obtenemos el elemento con id login
try {
    const resp = await fetch('/api/auth/profile'); //hacemos una peticion a la ruta /api/auth/profile
    if (resp.ok) {
        const user = await resp.json(); //    si la peticion es exitosa, obtenemos el json de la respuesta
        login.innerText = `Logout (${user.name})`; //    cambiamos el texto del elemento login por Logout (nombre del usuario)
        login.onclick = () => window.location.replace('/api/auth/logout'); //    cambiamos el evento onclick del elemento login para que redirija a la ruta /api/auth/logout
        const viewer = await initViewer(document.getElementById('preview')); //    inicializamos el viewer en el elemento con id preview
        initTree('#tree', (id) => loadModel(viewer, window.btoa(id).replace(/=/g, ''))); //    inicializamos el arbol en el elemento con id tree
    } else {
        login.innerText = 'Login'; //    si la peticion no es exitosa, cambiamos el texto del elemento login por Login
        login.onclick = () => window.location.replace('/api/auth/login'); //    cambiamos el evento onclick del elemento login para que redirija a la ruta /api/auth/login
    }
    login.style.visibility = 'visible'; //    hacemos visible el elemento login
} catch (err) {//si ocurre un error
    alert('Could not initialize the application. See console for more details.');//    mostramos un mensaje de error
    console.error(err);
}

