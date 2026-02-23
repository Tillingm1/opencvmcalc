document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('subsSlider');
  const numInput = document.getElementById('subsInput');
  const display = document.getElementById('subsDisplay');

  function updateDisplay() {
    const v = parseInt(numInput.value) || 100000;
    display.textContent = fmtSubs(v);
  }

  slider.addEventListener('input', () => {
    numInput.value = slider.value;
    updateDisplay();
  });

  numInput.addEventListener('input', () => {
    let v = parseInt(numInput.value);
    if (v < 100000) v = 100000;
    if (v > 20000000) v = 20000000;
    slider.value = v;
    updateDisplay();
  });

  // Ensure unchecked checkboxes still send a value
  document.getElementById('pricingForm').addEventListener('submit', (e) => {
    const form = e.target;
    ['flow', 'nbo', 'churn'].forEach(name => {
      const cb = form.querySelector(`input[name="${name}"]`);
      if (!cb.checked) {
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = name;
        hidden.value = '0';
        form.appendChild(hidden);
      }
    });
  });
});
