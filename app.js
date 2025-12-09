// تخزين الفواتير
let invoices = [];

// حساب الرصيد الحالي = المدور + المنحة الحالية
function calculateBalance() {
    const rolled = Number(document.getElementById("rolled").value) || 0;
    const grant = Number(document.getElementById("grant").value) || 0;
    const total = rolled + grant;
    document.getElementById("currentBalance").innerText = total.toFixed(2);
}

// إضافة فاتورة إلى القائمة
function addInvoice() {
    const no = document.getElementById("invoiceNo").value.trim();
    const date = document.getElementById("invoiceDate").value;
    const amount = Number(document.getElementById("invoiceAmount").value);

    if (!no || !date || !amount) {
        alert("يرجى إدخال رقم الفاتورة، التاريخ، والمبلغ");
        return;
    }

    invoices.push({ no, date, amount });
    updateInvoiceTable();
    calculateDistribution();
}

// تحديث جدول الفواتير
function updateInvoiceTable() {
    const tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";

    invoices.forEach(inv => {
        const row = document.createElement("tr");

        const c1 = document.createElement("td");
        c1.textContent = inv.no;

        const c2 = document.createElement("td");
        c2.textContent = inv.date;

        const c3 = document.createElement("td");
        c3.textContent = inv.amount.toFixed(2);

        row.appendChild(c1);
        row.appendChild(c2);
        row.appendChild(c3);
        tbody.appendChild(row);
    });
}

// حساب التوزيع المقترح (مبدئياً داخل حدود النسب فقط)
function calculateDistribution() {
    const totalInvoices = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    if (totalInvoices === 0) {
        document.getElementById("c1").innerText = "";
        document.getElementById("c2").innerText = "";
        document.getElementById("c3").innerText = "";
        document.getElementById("c4").innerText = "";
        document.getElementById("remain").innerText = "0.00";
        return;
    }

    // هنا مؤقتاً نختار نسب داخل الحدود فقط
    const p1 = randomInRange(5, 20); // مجتمعات التعلم
    const p2 = randomInRange(5, 40); // الصيانة
    const p3 = randomInRange(5, 15); // الشراكة
    const p4 = randomInRange(5, 40); // لوازم التعلم

    const v1 = (p1 / 100) * totalInvoices;
    const v2 = (p2 / 100) * totalInvoices;
    const v3 = (p3 / 100) * totalInvoices;
    const v4 = (p4 / 100) * totalInvoices;

    document.getElementById("c1").innerText = v1.toFixed(2);
    document.getElementById("c2").innerText = v2.toFixed(2);
    document.getElementById("c3").innerText = v3.toFixed(2);
    document.getElementById("c4").innerText = v4.toFixed(2);

    const distributed = v1 + v2 + v3 + v4;
    const remain = totalInvoices - distributed;
    document.getElementById("remain").innerText = remain.toFixed(2);
}

// دالة توليد رقم عشوائي بين حدين (للتوزيع المؤقت)
function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// تنزيل ملف Excel
function downloadExcel() {
    if (typeof XLSX === "undefined") {
        alert("لم يتم تحميل مكتبة Excel بشكل صحيح");
        return;
    }

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

// ربط الأزرار بعد تحميل الصفحة
window.addEventListener("DOMContentLoaded", () => {
    const calcBtn = document.getElementById("calcBtn");
    const addInvoiceBtn = document.getElementById("addInvoiceBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    if (calcBtn) calcBtn.addEventListener("click", calculateBalance);
    if (addInvoiceBtn) addInvoiceBtn.addEventListener("click", addInvoice);
    if (downloadBtn) downloadBtn.addEventListener("click", downloadExcel);
});
