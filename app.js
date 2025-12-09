let invoices = [];
let balance = 0;

function calculateBalance(){
    const rolledVal = Number(rolled.value) || 0;
    const grantVal  = Number(grant.value)  || 0;
    balance = rolledVal + grantVal;
    currentBalance.innerText = balance.toFixed(2);
}

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

async function testOpenExcel(){
    try {
        const res = await fetch("تحليل المنحة.xlsx");
        if(!res.ok){
            alert("❌ لم يتم العثور على الملف");
            return;
        }
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf,{type:"array"});
        alert("✅ تم فتح الملف بنجاح\nعدد الأوراق: " + wb.SheetNames.length);
    } catch(err){
        alert("❌ خطأ في الفتح: " + err.message);
    }
}

async function updateExcel(){
    const res = await fetch("تحليل المنحة.xlsx");
