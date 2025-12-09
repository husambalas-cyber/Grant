let invoices = [];

function calculateBalance() {
    const rolled = Number(document.getElementById("rolled").value);
    const grant = Number(document.getElementById("grant").value);
    const total = rolled + grant;
    document.getElementById("currentBalance").innerText = total;
}

function addInvoice() {
    const no = document.getElementById("invoiceNo").value;
    const date = document.getElementById("invoiceDate").value;
    const amount = Number(document.getElementById("invoiceAmount").value);

    invoices.push({ no, date, amount });

    updateInvoiceTable();
    calculateDistribution();
}

function updateInvoiceTable() {
    const tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";

    invoices.forEach(inv => {
        const row = `<tr>
            <td>${inv.no}</td>
            <td>${inv.date}</td>
            <td>${inv.amount}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function calculateDistribution() {
    const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    const p1 = randomInRange(5, 20);
    const p2 = randomInRange(5, 40);
    const p3 = randomInRange(5, 15);
    const p4 = randomInRange(5, 40);

    document.getElementById("c1").innerText = ((p1 / 100) * total).toFixed(2);
    document.getElementById("c2").innerText = ((p2 / 100) * total).toFixed(2);
    document.getElementById("c3").innerText = ((p3 / 100) * total).toFixed(2);
    document.getElementById("c4").innerText = ((p4 / 100) * total).toFixed(2);

    const full = (p1 + p2 + p3 + p4) / 100 * total;
    const remain = total - full;

    document.getElementById("remain").innerText = remain.toFixed(2);
}

function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function downloadExcel() {
    const wb = XLSX.utils.book_new();

    const header = [
        ["المديرية", document.getElementById("directorate").value],
        ["المدرسة", document.getElementById("school").value],
        ["الرصيد المدور", document.getElementById("rolled").value],
        ["المنحة الحالية", document.getElementById("grant").value],
        ["الرصيد الحالي", document.getElementById("currentBalance").innerText],
        [],
        ["الفواتير"],
        ["رقم الفاتورة", "التاريخ", "المبلغ"],
    ];

    const tableRows = invoices.map(inv => [inv.no, inv.date, inv.amount]);

    const ws = XLSX.utils.aoa_to_sheet([...header, ...tableRows]);
    XLSX.utils.book_append_sheet(wb, ws, "Grant");

    XLSX.writeFile(wb, "Grant.xlsx");
}
