let invoices = [];
let balance = 0;

// حساب الرصيد
function calculateBalance(){
    const rolledVal = Number(rolled.value) || 0;
    const grantVal  = Number(grant.value)  || 0;
    balance = rolledVal + grantVal;
    currentBalance.innerText = balance.toFixed(2);
}

// التحقق أن مجموع النسب = 100%
function validateMainPercents(){
    const sum =
        (Number(p1.value)||0) +
        (Number(p2.value)||0) +
        (Number(p3.value)||0) +
        (Number(p4.value)||0) +
        (Number(p5.value)||0);

    if(sum !== 100){
        percentWarning.innerText = "❌ مجموع نسب الصرف يجب أن يساوي 100%";
        return false;
    }
    percentWarning.innerText = "";
    return true;
}

[p1,p2,p3,p4,p5].forEach(inp=>{
    inp.addEventListener("input", validateMainPercents);
});

// اقتراح توزيع تلقائي
invoiceAmount.oninput = ()=>{
    const amount = Number(invoiceAmount.value) || 0;
    c1.value = (amount * (Number(p1.value)||0) / 100).toFixed(2);
    c2.value = (amount * (Number(p2.value)||0) / 100).toFixed(2);
    c3.value = (amount * (Number(p3.value)||0) / 100).toFixed(2);
    c4.value = (amount * (Number(p4.value)||0) / 100).toFixed(2);
    c5.value = (amount * (Number(p5.value)||0) / 100).toFixed(2);
    validateDistribution();
};

[c1,c2,c3,c4,c5].forEach(inp=>{
    inp.addEventListener("input", validateDistribution);
});

// التحقق من مجموع التوزيع
function validateDistribution(){
    const sum =
        (Number(c1.value)||0) +
        (Number(c2.value)||0) +
        (Number(c3.value)||0) +
        (Number(c4.value)||0) +
        (Number(c5.value)||0);

    sumDist.innerText = sum.toFixed(2);

    if(sum !== Number(invoiceAmount.value)){
        limitWarning.innerText = "❌ مجموع التوزيع يجب أن يساوي مبلغ الفاتورة";
        return false;
    }
    limitWarning.innerText = "";
    return true;
}

// إضافة فاتورة
function addInvoice(){
    if(!validateMainPercents()) return;
    if(!validateDistribution()) return;

    const inv = {
        no: invoiceNo.value,
        date: invoiceDate.value,
        c1: Number(c1.value),
        c2: Number(c2.value),
        c3: Number(c3.value),
        c4: Number(c4.value),
        c5: Number(c5.value)
    };

    invoices.push(inv);
    redrawTable();
}

// عرض الفواتير
function redrawTable(){
    const tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";

    invoices.forEach(inv=>{
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${inv.no}</td>
            <td>${inv.date}</td>
            <td>${inv.c1}</td>
            <td>${inv.c2}</td>
            <td>${inv.c3}</td>
            <td>${inv.c4}</td>
            <td>${inv.c5}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ✅ زر اختبار فتح ملف Excel
async function testOpenExcel(){
    try {
        const res = await fetch("تحليل المنحة.xlsx");
        if(!res.ok){
            alert("❌ لم يتم العثور على الملف في المستودع");
            return;
        }
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf,{type:"array"});
        alert(
            "✅ تم فتح الملف بنجاح\n" +
            "عدد الأوراق: " + wb.SheetNames.length + "\n" +
            wb.SheetNames.join("\n")
        );
    } catch(err){
        alert("❌ خطأ أثناء فتح الملف:\n" + err.message);
    }
}

// ✅ تحديث ملف Excel
async function updateExcel(){
    const res = await fetch("تحليل المنحة.xlsx");
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf,{type:"array"});
    const ws = wb.Sheets["تحليل منحة المدرسة"];

    ws["C4"] = {t:"s",v:directorate.value};
    ws["E4"] = {t:"s",v:school.value};
    ws["C6"] = {t:"n",v:Number(rolled.value)||0};
    ws["D6"] = {t:"n",v:Number(grant.value)||0};

    ws["C10"] = {t:"n",v:Number(p1.value)||0};
    ws["D10"] = {t:"n",v:Number(p2.value)||0};
    ws["E10"] = {t:"n",v:Number(p3.value)||0};
    ws["F10"] = {t:"n",v:Number(p4.value)||0};
    ws["G10"] = {t:"n",v:Number(p5.value)||0};

    let row = 25;

    invoices.forEach(inv=>{
        ws["B"+row] = {t:"s",v:inv.no};
        ws["C"+row] = {t:"s",v:inv.date};
        ws["D"+row] = {t:"n",v:inv.c1};
        ws["F"+row] = {t:"n",v:inv.c2};
        ws["H"+row] = {t:"n",v:inv.c3};
        ws["J"+row] = {t:"n",v:inv.c4};
        ws["N"+row] = {t:"n",v:inv.c5};
        row++;
    });

    XLSX.writeFile(wb,"تحليل المنحة.xlsx");
}
