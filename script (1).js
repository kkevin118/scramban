let recognition;
let isLoading = false;

// Base de conocimiento detallada
const knowledgeBase = {
    "Fecha": "Ingresa la fecha en que se realizará el trabajo en el formato dia mes año 24/02/2025.",
    "fecha": "Ingresa la fecha en que se realizará el trabajo en el formato dia mes año 24/02/2025.", "7:20pm": "Registra la hora exacta en que comenzará el trabajo.",
    "Hora de finalización": "7:00pm.",
    "OBRA": "Nombre o identificación del proyecto o obra donde se realizará el trabajo.",
    "ÁREA": "Zona o sector específico dentro de la obra donde se llevará a cabo el trabajo.",
    "Correo de la obra": "Correo electrónico de contacto para la obra.",
    "Tipo de trabajo en alturas": "Describe el tipo de actividad que se realizará (ej: mantenimiento, instalación, etc.).",
    "Sistema de acceso": "Método utilizado para acceder al área de trabajo (ej: escalera, andamio, plataforma elevada).",
    "Altura aproximada": "Estimación de la altura a la que se realizará el trabajo.",
    "Sistema de prevención": "Equipo o método de seguridad para prevenir caídas (arnés, línea de vida, redes de seguridad).",
    "Elementos de protección personal": "Lista de EPP requeridos (casco, gafas, guantes, calzado de seguridad, etc.).",
    "Prevención de caídas": "Medidas adicionales para evitar caídas (ej: señalización, demarcación del área).",
    "Estado de los trabajadores": "Verificación de que los trabajadores estén en condiciones físicas y mentales para el trabajo.",
    "Afiliación a seguridad social": "Confirmación de que los trabajadores tienen cobertura médica y laboral actualizada.",
    "Certificado de alturas": "Documento que acredita la capacitación de los trabajadores para trabajar en alturas.",
};

function cleanText(text) {
    // Elimina asteriscos, guiones bajos, acentos graves y HTML
    const cleaned = text.replace(/[*_`]/g, ''); // Quita *, _, `
    cleaned.replace(/(<([^>]+)>)/ig, ''); // Quita etiquetas HTML
    return cleaned;
}

function startSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.onresult = function(event) {
            document.getElementById('userInput').value = event.results[0][0].transcript;
            generateResponse();
        };
        recognition.start();
        recognition.onend = () => {
            recognition.start(); // Reinicia el reconocimiento si se detiene
        };
    } else {
        alert('Reconocimiento de voz no soportado en este navegador.');
    }
}

function speak(text) {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        speechSynthesis.speak(utterance);
    }
}

function generateResponse() {
    if (isLoading) return;
    isLoading = true;

    const userInput = document.getElementById('userInput').value.trim();
    const responseDiv = document.getElementById('responseDiv');

    if (!userInput) {
        responseDiv.textContent = "Por favor, ingresa una pregunta.";
        isLoading = false;
        return;
    }

    let responseText = knowledgeBase[userInput];
    if (responseText) {
        responseDiv.textContent = responseText;
        speak(responseText);
        isLoading = false;
    } else {
        fetch('response.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: userInput })
        })
        .then(response => response.json())
        .then(data => {
            isLoading = false;
            if (data.error) {
                responseDiv.textContent = `Error: ${data.error}`;
            } else {
                const cleanedText = cleanText(data.text);
                responseDiv.textContent = cleanedText;
                speak(cleanedText);
            }
        })
        .catch(() => {
            isLoading = false;
            responseDiv.textContent = "Lo siento, no pude procesar tu solicitud.";
        });
    }
}

function closePage() {
    window.close();
}