let invoices = [];
let fixedBalance = 0;

// ===============================
// ✅ حساب الرصيد مرة واحدة فقط
// ===============================
function calculateBalance(){
    const rolledVal = Number(rolled.value) || 0;
    const grantVal  = Number(grant.value)  || 0;

    fixedBalance = rolledVal + grantVal;
    currentBalance.innerText = fixedBalance.toFixed(2);

    updateTotals();
}

// ===============================
// ✅ فتح نموذج فاتورة جديدة + تفريغ الحقول
// ===============================
function showNewInvoiceForm(){
    invoiceNo.value = "";
    invoiceDate.value = "";
    invoiceAmount.value = "";

    document.getElementById("invoiceForm").style.display = "block";
    invoiceNo.focus();
}

// ===============================
// ✅ إضافة الفاتورة (بدون تفريغ الحقول)
// ===============================
function addInvoice(){
    const no = invoiceNo.value.trim();
    const date = invoiceDate.value;
    const amount = Number(invoiceAmount.value);

    if(!no || !date || !amount){
        alert("يرجى إدخال رقم الفاتورة والتاريخ والمبلغ");
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

    alert("تمت إضافة الفاتورة بنجاح");
}

// ===============================
// ✅ عرض جدول الفواتير + التعديل اليدوي
// ===============================
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

// ===============================
// ✅ تعديل توزيع الفاتورة يدويًا
// ===============================
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

// ===============================
// ✅ تحديث المجاميع بالأعلى
// ===============================
function updateTotals(){
    const totalInv = invoices.reduce((sum,i)=>sum + i.amount, 0);
    const remain  = fixedBalance - totalInv;

    totalInvoices.innerText = totalInv.toFixed(2);
    totalRemain.innerText   = remain.toFixed(2);
}

// =========================================================
// ✅ تحديث القالب الأصلي نفسه مع الحفاظ على التنسيق 100%
// =========================================================
async function downloadExcel(){

    const fileInput = document.getElementById("templateFile");

    if(!fileInput.files.length){
        alert("يرجى اختيار ملف القالب الأصلي أولًا");
        return;
    }

    const file = fileInput.files[0];

    // ✅ قراءة القالب كما هو (بكل تنسيقه)
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });

    const ws = wb.Sheets["تحليل منحة المدرسة"];

    // ===============================
    // ✅ تحديث خلايا الرأس فقط
    // ===============================
    ws["C4"] = { t:"s", v: directorate.value };                // المديرية
    ws["C5"] = { t:"s", v: school.value };                     // المدرسة
    ws["D5"] = { t:"n", v: Number(rolled.value) || 0 };        // الرصيد المدور
    ws["E5"] = { t:"n", v: Number(grant.value)  || 0 };        // المنحة الحالية

    // ===================================================
    // ✅ البحث عن آخر صف مستخدم في عمود المبلغ (E)
    // ===================================================
    let startRow = 25;
    for(let r = 25; r < 2000; r++){
        if(ws["E"+r] && ws["E"+r].v){
            startRow = r + 1;
        }
    }

    // ===================================================
    // ✅ إضافة الفواتير الجديدة أسفل الفواتير القديمة
    // ===================================================
    invoices.forEach((inv, index)=>{
        const r = startRow + index;

        ws["B"+r] = { t:"s", v: inv.no };       // رقم الفاتورة
        ws["C"+r] = { t:"n", v: index+1 };      // رقم القيد
        ws["D"+r] = { t:"s", v: inv.date };     // التاريخ
        ws["E"+r] = { t:"n", v: inv.amount };   // مبلغ الفاتورة

        ws["F"+r] = { t:"n", v: inv.c1 };        // مجتمعات التعلم
        ws["H"+r] = { t:"n", v: inv.c2 };        // الصيانة
        ws["J"+r] = { t:"n", v: inv.c3 };        // الشراكة
        ws["L"+r] = { t:"n", v: inv.c4 };        // لوازم التعلم
    });

    // ===============================
    // ✅ تنزيل نفس الملف الأصلي محدثًا
    // ===============================
    XLSX.writeFile(wb, file.name);
}

// ===============================
// ✅ ربط الأزرار بالأحداث
// ===============================
document.addEventListener("DOMContentLoaded", ()=>{
    calcBtn.onclick        = calculateBalance;
    newInvoiceBtn.onclick = showNewInvoiceForm;
    addInvoiceBtn.onclick = addInvoice;
    downloadBtn.onclick   = downloadExcel;
});
