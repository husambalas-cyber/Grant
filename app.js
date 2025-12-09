let invoices = [];
let balance = 0;

// ===============================
// ✅ حساب الرصيد الكلي
// ===============================
function calculateBalance(){
    const rolledVal = Number(rolled.value) || 0;
    const grantVal  = Number(grant.value)  || 0;

    balance = rolledVal + grantVal;
    currentBalance.innerText = balance.toFixed(2);
}

// ===============================
// ✅ التحقق أن مجموع النسب = 100%
// ===============================
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

// ===============================
// ✅ اقتراح توزيع تلقائي
// ===============================
invoiceAmount.oninput = ()=>{
    const amount = Number(invoiceAmount.value) || 0;

    c1.value = (amount * (Number(p1.value)||0) / 100).toFixed(2);
    c2.value = (amount * (Number(p2.value)||0) / 100).toFixed(2);
    c3.value = (amount * (Number(p3.value)||0) / 100).toFixed(2);
    c4.value = (amount * (Number(p4.value)||0) / 100).toFixed(2);
    c5.value = (amount * (Number(p5.value)||0) / 100).toFixed(2);

    validateDistribution();
};

// ===============================
// ✅ التحقق أن مجموع التوزيع = مبلغ الفاتورة
// ===============================
[c1,c2,c3,c4,c5].forEach(inp=>{
    inp.addEventListener("input", validateDistribution);
});

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

// ===============================
// ✅ إضافة الفاتورة مع المراقبة
// ===============================
function addInvoice(){

    if(!validateMainPercents()){
        alert("يجب أن يكون مجموع نسب الصرف = 100%");
        return;
    }

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

    const sum1 = invoices.reduce((s,i)=>s+i.c1,0) + inv.c1;
    const sum2 = invoices.reduce((s,i)=>s+i.c2,0) + inv.c2;
    const sum3 = invoices.reduce((s,i)=>s+i.c3,0) + inv.c3;
    const sum4 = invoices.reduce((s,i)=>s+i.c4,0) + inv.c4;
    const sum5 = invoices.reduce((s,i)=>s+i.c5,0) + inv.c5;

    if(sum1 > (balance * p1.value / 100)){ alert("❌ تجاوز مجتمعات التعلم"); return; }
    if(sum2 > (balance * p2.value / 100)){ alert("❌ تجاوز الصيانة"); return; }
    if(sum3 > (balance * p3.value / 100)){ alert("❌ تجاوز الشراكة"); return; }
    if(sum4 > (balance * p4.value / 100)){ alert("❌ تجاوز لوازم التعلم"); return; }
    if(sum5 > (balance * p5.value / 100)){ alert("❌ تجاوز تشجيع التميز"); return; }

    invoices.push(inv);
    redrawTable();
}

// ===============================
// ✅ عرض جدول الفواتير
// ===============================
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

// ===============================
// ✅ اختبار فتح ملف Excel من المستودع
// ===============================
async function testOpenExcel(){
    try {
        const res = await fetch("تحليل المنحة.xlsx");

        if(!res.ok){
            alert("❌ لم يتم العثور على الملف في المستودع\nتأكد أن الاسم مطابق تمامًا: تحليل المنحة.xlsx");
            return;
        }

        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf,{type:"array"});

        alert(
            "✅ تم فتح الملف بنجاح!\n\n" +
            "عدد الأوراق: " + wb.SheetNames.length + "\n" +
            "الأوراق:\n" + wb.SheetNames.join("\n")
        );

    } catch(err){
        alert("❌ خطأ أثناء فتح الملف:\n" + err.message);
    }
}

// ===============================
// ✅ فتح ملف Excel من المستودع وتحديثه
// ===============================
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
