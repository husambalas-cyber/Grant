let invoices = [];
let fixedBalance = 0;

// ✅ حساب الرصيد الكلي مرة واحدة
function calculateBalance(){
    const rolledVal = Number(rolled.value) || 0;
    const grantVal  = Number(grant.value)  || 0;

    fixedBalance = rolledVal + grantVal;
    currentBalance.innerText = fixedBalance.toFixed(2);

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

// ✅ عرض الجدول
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

    document.querySelectorAll("#invoiceTable input").forEach(inp=>{
        inp.addEventListener("input", editDist);
    });
}

// ✅ تعديل التوزيع
function editDist(e){
    const i = Number(e.target.dataset.i);
    const field = e.target.dataset.f;
    const value = Number(e.target.value) || 0;

    invoices[i][field] = value;

    const inv = invoices[i];
    const remain = inv.amount - (inv.c1 + inv.c2 + inv.c3 + inv.c4);

    e.target.closest("tr").querySelector(".remain").innerText = remain.toFixed(2);

    updateTotals();
}

// ✅ تحديث المجاميع
function updateTotals(){
    const totalInv = invoices.reduce((sum,i)=>sum + i.amount, 0);
    const remain  = fixedBalance - totalInv;

    totalInvoices.innerText = totalInv.toFixed(2);
    totalRemain.innerText   = remain.toFixed(2);
}

// ✅ إنتاج نسخة جديدة من ملف "تحليل المنحة" مع تحديث الخلايا فقط
async function downloadExcel(){

    const response = await fetch("تحليل المنحة.xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });

    const ws = wb.Sheets["تحليل منحة المدرسة"];

    // ✅ تحديث الخلايا المسموح بها فقط
    ws["C4"] = { t:"s", v: directorate.value };
    ws["C5"] = { t:"s", v: school.value };
    ws["D5"] = { t:"n", v: Number(rolled.value) || 0 };
    ws["E5"] = { t:"n", v: Number(grant.value)  || 0 };

    let startRow = 25;

    invoices.forEach((inv, index)=>{
        const r = startRow + index;

        ws["B"+r] = { t:"s", v: inv.no };
        ws["C"+r] = { t:"n", v: index+1 };
        ws["D"+r] = { t:"s", v: inv.date };
        ws["E"+r] = { t:"n", v: inv.amount };

        ws["F"+r] = { t:"n", v: inv.c1 };
        ws["H"+r] = { t:"n", v: inv.c2 };
        ws["J"+r] = { t:"n", v: inv.c3 };
        ws["L"+r] = { t:"n", v: inv.c4 };
    });

    // ✅ إنتاج نسخة جديدة محدثة مع الحفاظ على القالب
    XLSX.writeFile(wb, "تحليل المنحة_معبأ.xlsx");
}

// ✅ ربط الأزرار
document.addEventListener("DOMContentLoaded", ()=>{
    calcBtn.onclick       = calculateBalance;
    addInvoiceBtn.onclick = addInvoice;
    downloadBtn.onclick   = downloadExcel;
});
