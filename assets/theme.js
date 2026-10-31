(function () {
  // Gallery thumbs
  document.querySelectorAll('.product-page__thumbs .thumb').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.product-page__thumbs .thumb').forEach(function (t) {
        t.classList.remove('is-active');
      });
      btn.classList.add('is-active');
      var main = document.getElementById('ProductMainImage');
      var src = btn.getAttribute('data-src');
      if (main && src) {
        main.style.opacity = '0.4';
        setTimeout(function () {
          main.src = src;
          main.style.opacity = '1';
        }, 120);
      }
    });
  });

  // Variant picker (simple)
  var jsonEl = document.getElementById('ProductVariantsJson');
  var form = document.getElementById('ProductForm');
  var variantInput = document.getElementById('ProductVariantId');
  var priceEl = document.getElementById('ProductPrice');
  if (!jsonEl || !form || !variantInput) return;

  var variants = [];
  try { variants = JSON.parse(jsonEl.textContent); } catch (e) { return; }

  function selectedOptions() {
    var values = [];
    document.querySelectorAll('.option-list').forEach(function (list) {
      var active = list.querySelector('.option-pill.is-active');
      values.push(active ? active.getAttribute('data-value') : null);
    });
    return values;
  }

  function findVariant(options) {
    return variants.find(function (v) {
      return options.every(function (opt, i) {
        return !opt || v.options[i] === opt;
      });
    });
  }

  document.querySelectorAll('.option-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      var list = pill.closest('.option-list');
      list.querySelectorAll('.option-pill').forEach(function (p) { p.classList.remove('is-active'); });
      pill.classList.add('is-active');

      var match = findVariant(selectedOptions());
      if (!match) return;
      variantInput.value = match.id;
      if (priceEl) {
        var amount = (match.price / 100).toFixed(2);
        priceEl.textContent = '$' + amount;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        if (match.available) {
          btn.disabled = false;
          btn.textContent = 'Купить · $' + (match.price / 100).toFixed(2);
        } else {
          btn.disabled = true;
          btn.textContent = 'Нет в наличии';
        }
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = Number(variantInput.value);
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: id, quantity: 1 }] })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('cart');
        return r.json();
      })
      .then(function () {
        window.location.href = '/cart';
      })
      .catch(function () {
        form.submit();
      });
  });
})();
