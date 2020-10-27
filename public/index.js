let transactions = [];
let myChart;

fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // save db data on global variable
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
  });

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    let date = new Date(transaction.date);
    let dates = `${date.getMonth() + 1}/${date.getDate() + 1}/${date.getFullYear()}`;
    let data_id = transaction._id;
    tr.innerHTML = `
      <td>${dates}</td>
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
      <td><button class="btn btn-outline-primary float-right"><i class="fa fa-circle-o" data-id=${data_id}></i></button></td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate() + 1}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: "Your Funds",
        fill: true,
        backgroundColor: "#D33682",
        data
      }]
    }
  });
}

function sendTransaction(isAdding) {
  let dateEl = document.querySelector("#t-date");
  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "" || dateEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: dateEl.value
  };

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  // also send to server
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (data.errors) {
        errorEl.textContent = "Missing Information";
      }
      else {
        // clear form
        nameEl.value = "";
        amountEl.value = "";
        dateEl.value = "";
      }
    })
    .catch(err => {
      // fetch failed, so save in indexed db
      saveRecord(transaction);

      // clear form
      nameEl.value = "";
      amountEl.value = "";
      dateEl.value = "";
    });
}

document.querySelector('table').onclick = function handleClearedBank(event) {

  if (event.target.tagName != 'I') {
    return;
  }
  const data_id = event.target.getAttribute('data-id');
  const checkIcon = event.target;
  const clearedBtn = event.target.closest('button');
  let cleared;
  if (event.target.classList.contains('fa-circle-o')) {
    checkIcon.classList.remove("fa-circle-o");
    clearedBtn.classList.remove("btn-outline-primary");
    checkIcon.classList.add("fa-check");
    clearedBtn.classList.add("btn-primary");
    cleared = true;
  } else {
    checkIcon.classList.remove("fa-check");
    clearedBtn.classList.remove("btn-primary");
    checkIcon.classList.add("fa-circle-o");
    clearedBtn.classList.add("btn-outline-primary");
    cleared = false;
  }

  fetch("/api/transaction" + data_id, {
    method: "post",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cleared)
  })
    .then(function (response) {
      return response.json();
    })
    .catch(function (err) {
      console.log("Fetch Error :-S", err);
    });
}

document.querySelector("#add-btn").onclick = function () {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function () {
  sendTransaction(false);
};
