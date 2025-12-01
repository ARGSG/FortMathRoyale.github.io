//  Variables
const MAX_PREGUNTAS = 10;
let puntaje = 0;
let preguntasRespondidas = 0;
let dificultadActual = 'facil';
let escudo = 100; // El escudo empieza al 100%
let respuestaCorrecta = 0;


const dom = {
    // Pantallas
    inicio: document.getElementById('pantalla-inicio'),
    juego: document.getElementById('pantalla-juego'),
    fin: document.getElementById('pantalla-fin'),
    
    // HUD de Juego
    escudoRelleno: document.getElementById('escudo-relleno'),
    puntajeActual: document.getElementById('puntaje-actual'),
    contadorPregunta: document.getElementById('contador-pregunta'),
    enunciado: document.getElementById('enunciado-pregunta'),
    opciones: document.querySelector('.opciones-respuesta'),
    feedback: document.getElementById('feedback-mensaje'),

    // Pantalla Final
    tituloResultado: document.getElementById('titulo-resultado'),
    mensajeFinal: document.getElementById('mensaje-final'),
    puntajeFinal: document.getElementById('puntaje-final'),
    nivelAlcanzado: document.getElementById('nivel-alcanzado'),
    btnReiniciar: document.getElementById('btn-reiniciar')
};

// Mostrar la pantalla
function mostrarPantalla(id) {
    dom.inicio.hidden = true;
    dom.juego.hidden = true;
    dom.fin.hidden = true;
    
    document.getElementById(id).hidden = false;
}

// nicia el juego con la dificultad seleccionada
function iniciarJuego(dificultad) {
    // Resetear el estado del juego
    puntaje = 0;
    preguntasRespondidas = -2;
    escudo = 100;
    dificultadActual = dificultad;
    
    // Actualiza HUD y mostrar la pantalla de juego
    actualizarHUD();
    actualizarEscudo(0); // Inicializa la barra al 100%
    mostrarPantalla('pantalla-juego');
    
    // Generar la primera pregunta
    generarNuevaPregunta();
}

// Termina el juego y muestra la pantalla de resultados
function finalizarJuego(fueVictoria) {
    // 1. Mostrar la pantalla de fin
    mostrarPantalla('pantalla-fin');

    // Determinar el mensaje y el estilo
    if (fueVictoria) {
        dom.tituloResultado.textContent = '¡VICTORIA REAL!';
        dom.tituloResultado.classList.add('victoria');
        dom.tituloResultado.classList.remove('derrota');
        dom.mensajeFinal.textContent = '¡Sobreviviste a la Tormenta Matemática y dominaste el cálculo!';
    } else {
        dom.tituloResultado.textContent = '¡ELIMINADO!';
        dom.tituloResultado.classList.add('derrota');
        dom.tituloResultado.classList.remove('victoria');
        dom.mensajeFinal.textContent = 'Fuiste superado por la Tormenta. ¡Mejora tu velocidad para la próxima!';
    }
    
    // Mostrar las estadísticas finales
    dom.puntajeFinal.textContent = puntaje;
    dom.nivelAlcanzado.textContent = dificultadActual.toUpperCase();
}


// Funciones de Mecánica de Juego y Didáctica

// Actualiza los valores de la barra de escudo. deltaEscudo puede ser positivo o negativo.
function actualizarEscudo(deltaEscudo) {
    escudo = Math.max(0, Math.min(100, escudo + deltaEscudo)); // Limita el escudo entre 0 y 100
    dom.escudoRelleno.style.width = `${escudo}%`;

    // perder
    if (escudo === 0) {
        finalizarJuego(false);
    }
}

// Genera la operación matemática según la dificultad actual
function generarOperacion() {
    let num1, num2, operador, resultado, max;

    // Lógica de dificultad graduada
    if (dificultadActual === 'facil') {
        max = 30; // Números pequeños para sumas/restas
        num1 = Math.floor(Math.random() * max) + 1;
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // Para que la resta no sea negativa
        operador = Math.random() < 0.5 ? '+' : '-';
    } else if (dificultadActual === 'medio') {
        max = 10; // Tablas de multiplicar hasta el 10
        num1 = Math.floor(Math.random() * max) + 2;
        num2 = Math.floor(Math.random() * max) + 2;
        operador = 'x';
    } else { // dificil (Combinado y más grandes)
        max = 50;
        num1 = Math.floor(Math.random() * max) + 1;
        num2 = Math.floor(Math.random() * max) + 1;
        const ops = ['+', '-', 'x'];
        operador = ops[Math.floor(Math.random() * ops.length)];

        // Ajuste para evitar restas negativas
        if (operador === '-' && num1 < num2) {
            [num1, num2] = [num2, num1]; // Intercambia los números
        }
    }

    // Calcular el resultado
    if (operador === '+') resultado = num1 + num2;
    else if (operador === '-') resultado = num1 - num2;
    else if (operador === 'x') resultado = num1 * num2;
    
    // Enunciado
    const enunciado = `${num1} ${operador} ${num2} = ?`;
    
    return { enunciado, resultado };
}

// Genera la pregunta, las opciones
function generarNuevaPregunta() {
    if (preguntasRespondidas >= MAX_PREGUNTAS) {
        return finalizarJuego(true); // Gana si responde todas las preguntas
    }
    
    // Generar la operación
    const { enunciado, resultado } = generarOperacion();
    respuestaCorrecta = resultado;
    
    //Generar las opciones de respuesta (incluyendo la correcta)
    const opciones = generarOpcionesDistractoras(resultado);
    
    // Renderizar en el DOM
    dom.enunciado.textContent = enunciado;
    dom.opciones.innerHTML = ''; // Limpiar botones anteriores
    dom.feedback.textContent = ''; // Limpiar feedback

    //  Crear los botones
    opciones.forEach(opcion => {
        const btn = document.createElement('button');
        btn.textContent = opcion;
        btn.onclick = () => verificarRespuesta(opcion);
        dom.opciones.appendChild(btn);
    });

    //  Actualizar el contador de preguntas
    preguntasRespondidas++;
    actualizarHUD();
}

//Genera tres opciones incorrectas alrededor de la respuesta correcta */
function generarOpcionesDistractoras(resultadoCorrecto) {
    const opciones = new Set();
    opciones.add(resultadoCorrecto);

    while (opciones.size < 3) { // las 3 opciones
        let distractor;
        // Generar un distractor
        const offset = [1, -1, 2, -2, 5, -5];
        distractor = resultadoCorrecto + offset[Math.floor(Math.random() * offset.length)];
        
        // Asegurarse de que el distractor no sea negativo y sea diferente
        if (distractor > 0) { 
            opciones.add(distractor);
        }
    }
    
    // Mezclar para que la respuesta correcta no esté siempre en el mismo lugar
    let opcionesArray = Array.from(opciones);
    for (let i = opcionesArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opcionesArray[i], opcionesArray[j]] = [opcionesArray[j], opcionesArray[i]];
    }
    
    return opcionesArray;
}

// Verifica si la respuesta del usuario es correcta 
function verificarRespuesta(respuestaUsuario) {
    // Deshabilitar los botones para evitar doble clic
    Array.from(dom.opciones.children).forEach(btn => btn.disabled = true);

    const esCorrecta = (parseInt(respuestaUsuario) === respuestaCorrecta);

    if (esCorrecta) {
        puntaje += 10;
        actualizarEscudo(15); // Recompensa: Recarga el escudo
        mostrarFeedback('¡ESCUDO RECARGADO!', 'acierto');
    } else {
        actualizarEscudo(-20); // Penalización: Daño por la tormenta
        mostrarFeedback('¡ZONA PELIGROSA!', 'error');
    }

    // Esperar un momento y generar la siguiente pregunta
    setTimeout(generarNuevaPregunta, 1000); // 1 segundo de pausa para ver el feedback
}

// Muestra el feedback de acierto o error
function mostrarFeedback(mensaje, tipo) {
    dom.feedback.textContent = mensaje;
    dom.feedback.classList.remove('acierto', 'error');
    dom.feedback.classList.add(tipo);
}

// Actualiza los contadores en el HUD
function actualizarHUD() {
    dom.puntajeActual.textContent = puntaje;
    dom.contadorPregunta.textContent = preguntasRespondidas + 1; // Muestra la siguiente pregunta a responder
}


// Eventos de los botones de nivel
document.querySelectorAll('.botones-nivel button').forEach(button => {
    button.addEventListener('click', (e) => {
        const dificultad = e.target.getAttribute('data-dificultad');
        iniciarJuego(dificultad);
    });
});

// Evento del botón de Reiniciar
dom.btnReiniciar.addEventListener('click', () => {
    mostrarPantalla('pantalla-inicio');
});

// Al cargar la página, empezar en el menú de inicio
window.onload = () => {
    mostrarPantalla('pantalla-inicio');

};

