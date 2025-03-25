// Umbral para decidir si una tarjeta se acepta o rechaza
const DECISION_THRESHOLD = 75;

// Variables de estado
let isAnimating = false; // Previene múltiples animaciones simultáneas
let pullDeltaX = 0; // Diferencia en la posición X al arrastrar

/**
 * Función para iniciar el arrastre de la tarjeta
 * @param {MouseEvent | TouchEvent} event
 */
function startDrag(event) {
  if (isAnimating) return; // Evita interacción mientras se anima

  // Selecciona la tarjeta más cercana al punto de inicio del evento
  const actualCard = event.target.closest("article");
  if (!actualCard) return; // Si no hay tarjeta, salir

  // Obtiene la posición inicial del cursor (mouse o táctil)
  const startX = event.pageX ?? event.touches[0].pageX;

  // Agrega los eventos de movimiento y finalización
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onEnd);

  document.addEventListener("touchmove", onMove, { passive: true });
  document.addEventListener("touchend", onEnd, { passive: true });

  /**
   * Maneja el movimiento del cursor o el dedo
   * @param {MouseEvent | TouchEvent} event
   */
  function onMove(event) {
    const currentX = event.pageX ?? event.touches[0].pageX;

    pullDeltaX = currentX - startX; // Diferencia con la posición inicial

    if (pullDeltaX === 0) return; // Si no hay movimiento, salir

    isAnimating = true; // Marca que hay animación en curso

    const deg = pullDeltaX / 14; // Calcula el ángulo de inclinación

    // Aplica la transformación a la tarjeta (desplazamiento y rotación)
    actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`;
    actualCard.style.cursor = "grabbing";

    // Calcula la opacidad del indicador de decisión (LIKE o NOPE)
    const opacity = Math.abs(pullDeltaX) / 100;
    const isRight = pullDeltaX > 0;

    // Selecciona el indicador correcto y cambia su opacidad
    const choiceEl = isRight
      ? actualCard.querySelector(".choice.like")
      : actualCard.querySelector(".choice.nope");

    if (choiceEl) {
      choiceEl.style.opacity = opacity;
    }
  }

  /**
   * Maneja el final del arrastre y decide qué hacer con la tarjeta
   * @param {MouseEvent | TouchEvent} event
   */
  function onEnd() {
    // Remueve los eventos al soltar el botón o levantar el dedo
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);

    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);

    const decisionMade = Math.abs(pullDeltaX) >= DECISION_THRESHOLD;

    if (decisionMade) {
      // Determina la dirección del deslizamiento
      const goRight = pullDeltaX >= 0;
      actualCard.classList.add(goRight ? "go-right" : "go-left");

      // Elimina la tarjeta después de la animación
      actualCard.addEventListener("transitionend", () => {
        actualCard.remove();
      });
    } else {
      // Si no se tomó una decisión, regresa la tarjeta a su posición original
      actualCard.classList.add("reset");
      actualCard.classList.remove("go-right", "go-left");

      actualCard.querySelectorAll(".choice").forEach((choice) => {
        choice.style.opacity = 0;
      });
    }

    // Al final de la animación, restablece los valores y permite nuevas interacciones
    actualCard.addEventListener("transitionend", () => {
      actualCard.removeAttribute("style");
      actualCard.classList.remove("reset");

      pullDeltaX = 0;
      isAnimating = false;
    });

    // Asegura que los indicadores (LIKE/NOPE) queden ocultos al soltar
    actualCard
      .querySelectorAll(".choice")
      .forEach((el) => (el.style.opacity = 0));
  }
}

// Agrega los eventos para detectar el inicio del arrastre
document.addEventListener("mousedown", startDrag);
document.addEventListener("touchstart", startDrag, { passive: true });
