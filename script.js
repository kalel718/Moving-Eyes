// First, we grab a reference to our main SVG element that contains all the eyes.
  const eyesSVG = document.querySelector('#eyes');

  // We'll create an array to easily manage both the left and right eyes.
  // Each object in the array will hold references to an eye's main shape and its pupil,
  // along with an 'offsetX' property we'll calculate later for proper positioning.
  const eyes = [
    {
      eye: eyesSVG.querySelector('#eye-left'),    // Reference to the left eye's outer shape
      pupil: eyesSVG.querySelector('#pupil-left'), // Reference to the left eye's pupil
      offsetX: 0                                   // Placeholder for horizontal offset calculation
    },
    {
      eye: eyesSVG.querySelector('#eye-right'),   // Reference to the right eye's outer shape
      pupil: eyesSVG.querySelector('#pupil-right'),// Reference to the right eye's pupil
      offsetX: 0                                   // Placeholder for horizontal offset calculation
    }
  ];


// This function calculates and updates the position of a single pupil.
  // It takes the mouse event (ev) and the specific eye's properties as input.
  const updateEye = (ev, {eye, pupil, offsetX}) => {
    // Get the size and position of the current eye on the screen.
    const eyeRect = eye.getBoundingClientRect();
    // Calculate the center point of the eye.
    const centerX = eyeRect.left + eyeRect.width / 2;
    const centerY = eyeRect.top + eyeRect.height / 2;

    // Determine the distance from the mouse cursor to the center of the eye.
    const distX = ev.clientX - centerX;
    const distY = ev.clientY - centerY;

    // Get the size of the pupil to calculate its movement limits.
    const pupilRect = pupil.getBoundingClientRect();
    const maxDistX = pupilRect.width / 2;
    const maxDistY = pupilRect.height / 2;

    // Calculate the angle from the eye's center to the mouse position.
    const angle = Math.atan2(distY, distX);

    // Determine the new X and Y positions for the pupil, ensuring it stays within the eye's bounds.
    // We use cosine for X and sine for Y, scaled by the maximum allowed distance.
    const newPupilX = offsetX + Math.min(maxDistX, Math.max(-maxDistX, Math.cos(angle) * maxDistX));
    const newPupilY = Math.min(maxDistY, Math.max(-maxDistY, Math.sin(angle) * maxDistY));

    // Get the SVG's transformation matrix to correctly scale pupil movement.
    const svgCTM = eyesSVG.getScreenCTM();
    // Scale the pupil's movement based on the SVG's current scaling.
    const scaledPupilX = newPupilX / svgCTM.a;
    const scaledPupilY = newPupilY / svgCTM.d;

    // Apply the calculated translation to the pupil using an SVG transform.
    pupil.setAttribute('transform', `translate(${scaledPupilX}, ${scaledPupilY})`);
  }


   // This function calculates the initial horizontal offset for each pupil.
  // This ensures the pupils start in the correct position relative to their eyes.
  const calcOffset = () => {
    for (const props of eyes) {
      // First, remove any existing transform to get the pupil's natural position.
      props.pupil.removeAttribute('transform');
      const eyeRect = props.eye.getBoundingClientRect();
      const pupilRect = props.pupil.getBoundingClientRect();
      // Calculate the offset needed to center the pupil horizontally within the eye's available space.
      props.offsetX = ((eyeRect.right - pupilRect.right) - (pupilRect.left - eyeRect.left)) / 2;
    }
  }
  // Call calcOffset once when the script loads to set initial pupil positions.
  calcOffset();

  // Listen for window resize events to recalculate pupil offsets.
  // This keeps the eyes responsive and ensures pupils stay centered even if the page scales.
  globalThis.addEventListener('resize', () => {
    calcOffset();
  });

  // This variable will hold our animation frame ID, helping us make animations smooth.
  let frame = 0;
  // Listen for mouse movement across the entire window.
  globalThis.addEventListener('mousemove', (ev) => {
    // Cancel any pending animation frame to prevent jerky movements.
    cancelAnimationFrame(frame);
    // Request a new animation frame for the next visual update.
    // This ensures updates happen at the browser's optimal refresh rate.
    frame = requestAnimationFrame(() => {
      // For each eye, update its pupil's position based on the current mouse coordinates.
      for (const eye of eyes) {
        updateEye(ev, eye);
      }
    });
  });
