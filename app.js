let invoices = [];
let fixedBalance = 0;

function calculateBalance(){
    const rolled = Number(document.getElementById("rolled").value);
    const grant = Number(document.getElementById("grant").value);
    fixedBalance = rolled + grant;
    document.getElementById("currentBalance").innerText = fixedBalance.toFixed(2);
    updateTotals();
}

function addInvoice(){
    const no = invoiceNo.value;
    const date = invoiceDate.value;
    const amount = Number(invoiceAmount.value);

    if(!no || !date || !amount){
        alert("أكمل جميع بيانات الفاتورة");
        return;
    }

    invoices.push({
        no,date,amount,
        c1:(amount*0.1),
        c2:(amount*0.3),
        c3:(amount*0.1),
        c4:(amount*0.5)
    });

    updateInvoiceTable();
    updateTotals();
}

function updateInvoiceTable(){
    const tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";

    invoices.forEach((inv,i)=>{
        const remain = inv.amount - (inv.c1+inv.c2+inv.c3+inv.c4);

        const row = `
        <tr>
        <td>${inv.no}</td>
        <td>${inv.date}</td>
        <td>${inv.amount.toFixed(2)}</td>
        <td><input type="number" value="${inv.c1.toFixed(2)}" oninput="editDist(${i},'c1',this.value)"></td>
        <td><input type="number" value="${inv.c2.toFixed(2)}" oninput="editDist(${i},'c2',this.value)"></td>
        <td><input type="number" value="${inv.c3.toFixed(2)}" oninput="editDist(${i},'c3',this.value)"></td>
        <td><input type="number" value="${inv.c4.toFixed(2)}" oninput="editDist(${i},'c4',this.value)"></td>
        <td>${remain.toFixed(2)}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function editDist(i,field,val){
    invoices[i][field] = Number(val);
    updateInvoiceTable();
    updateTotals();
}

function updateTotals(){
    const totalInv = invoices.reduce((s,i)=>s+i.amount,0);
    const remain = fixedBalance - totalInv;

    document.getElementById("totalInvoices").innerText = totalInv.toFixed(2);
    document.getElementById("totalRemain").innerText = remain.toFixed(2);
}

function downloadExcel(){
    const wb = XLSX.utils.book_new();

    const header = [
        ["المديرية",directorate.value],
        ["المدرسة",school.value],
        ["الرصيد الكلي",fixedBalance],
        [],
        ["رقم","تاريخ","المبلغ","تعلم","صيانة","شراكة","لوازم","متبقي"]
    ];

    const rows = invoices.map(i=>[
        i.no,i.date,i.amount,i.c1,i.c2,i.c3,i.c4,
        i.amount-(i.c1+i.c2+i.c3+i.c4)
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...header,...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "المنحة");

    XLSX.writeFile(wb,"Grant.xlsx");
}

document.addEventListener("DOMContentLoaded",()=>{
    calcBtn.onclick = calculateBalance;
    addInvoiceBtn.onclick = addInvoice;
    downloadBtn.onclick = downloadExcel;
});
