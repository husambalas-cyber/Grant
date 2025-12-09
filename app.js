let invoices = [];
let fixedBalance = 0;

// ✅ حساب الرصيد مرة واحدة فقط
function calculateBalance(){
    const rolled = Number(document.getElementById("rolled").value) || 0;
    const grant = Number(document.getElementById("grant").value) || 0;

    fixedBalance = rolled + grant;

    document.getElementById("currentBalance").innerText = fixedBalance.toFixed(2);
    updateTotals();
}

// ✅ إضافة فاتورة
function addInvoice(){
    const no = invoiceNo.value.trim();
    const date = invoiceDate.value;
    const amount = Number(invoiceAmount.value);

    if(!no || !date || !amount){
        alert("يرجى إدخال جميع بيانات الفاتورة");
        return;
    }

    // ✅ توزيع افتراضي قابل للتعديل
    invoices.push({
        no,
        date,
        amount,
        c1: amount * 0.10,
        c2: amount * 0.30,
        c3: amount * 0.10,
        c4: amount * 0.50
    });

    updateInvoiceTable();
    updateTotals();
}

// ✅ تحديث جدول الفواتير بدون كسر التعديلات
function updateInvoiceTable(){
    const tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";

    invoices.forEach((inv,i)=>{
        const remain = inv.amount - (inv.c1 + inv.c2 + inv.c3 + inv.c4);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${inv.no}</td>
            <td>${inv.date}</td>
            <td>${inv.amount.toFixed(2)}</td>

            <td><input type="number" value="${inv.c1.toFixed(2)}" data-i="${i}" data-f="c1"></td>
            <td><input type="number" value="${inv.c2.toFixed(2)}" data-i="${i}" data-f="c2"></td>
            <td><input type="number" value="${inv.c3.toFixed(2)}" data-i="${i}" data-f="c3"></td>
            <td><input type="number" value="${inv.c4.toFixed(2)}" data-i="${i}" data-f="c4"></td>

            <td class="remain">${remain.toFixed(2)}</td>
        `;

        tbody.appendChild(tr);
    });

    // ✅ ربط التعديل مباشرة بدون إعادة رسم الجدول
    document.querySelectorAll("#invoiceTable input").forEach(inp=>{
        inp.addEventListener("input", editDist);
    });
}

// ✅ تعديل التوزيع اليدوي مباشرة
function editDist(e){
    const i = Number(e.target.dataset.i);
    const field = e.target.dataset.f;
    const value = Number(e.target.value) || 0;

    invoices[i][field] = value;

    const inv = invoices[i];
    const remain = inv.amount - (inv.c1 + inv.c2 + inv.c3 + inv.c4);

    // ✅ تحديث الرصيد المتبقي للسطر فقط
    const row = e.target.closest("tr");
    row.querySelector(".remain").innerText = remain.toFixed(2);

    updateTotals();
}

// ✅ تحديث المجاميع بالأعلى
function updateTotals(){
    const totalInv = invoices.reduce((sum,i)=>sum + i.amount, 0);
    const remain = fixedBalance - totalInv;

    document.getElementById("totalInvoices").innerText = totalInv.toFixed(2);
    document.getElementById("totalRemain").innerText = remain.toFixed(2);
}

// ✅ تنزيل ملف Excel مطابق للجدول
function downloadExcel(){
    if(typeof XLSX === "undefined"){
        alert("مكتبة الإكسل لم يتم تحميلها");
        return;
    }

    const wb = XLSX.utils.book_new();

    const header = [
        ["المديرية", directorate.value],
        ["المدرسة", school.value],
        ["الرصيد الكلي", fixedBalance],
        [],
        ["رقم","تاريخ","المبلغ","تعلم","صيانة","شراكة","لوازم","متبقي"]
    ];

    const rows = invoices.map(i => [
        i.no,
        i.date,
        i.amount.toFixed(2),
        i.c1.toFixed(2),
        i.c2.toFixed(2),
        i.c3.toFixed(2),
        i.c4.toFixed(2),
        (i.amount - (i.c1+i.c2+i.c3+i.c4)).toFixed(2)
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...header, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "المنحة");

    XLSX.writeFile(wb,"Grant.xlsx");
}

// ✅ ربط الأزرار بشكل آمن
document.addEventListener("DOMContentLoaded",()=>{
    calcBtn.onclick = calculateBalance;
    addInvoiceBtn.onclick = addInvoice;
    downloadBtn.onclick = downloadExcel;
});
