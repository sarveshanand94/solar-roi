function generate() {
    const name = document.getElementById("userName").value;
    const bill = Number(document.getElementById("avgBill").value);
    const cost = Number(document.getElementById("solarCost").value);
    const subsidy = Number(document.getElementById("subsidy").value);

    const netCost = cost - subsidy;
    const yearlyBill = bill * 6; // 6 billing cycles
    const yearlySavings = yearlyBill;

    let totalSavings = 0;
    let year = 0;
    let breakeven = 0;
    let ebBill = yearlyBill;

    while (totalSavings < netCost && year < 25) {
        totalSavings += ebBill;
        year++;
        ebBill *= 1.04; // 4% inflation
        if (breakeven === 0 && totalSavings >= netCost) breakeven = year;
    }

    const lifetimeSavings = totalSavings - netCost;

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1080, 1350);

    ctx.fillStyle = "#000";
    ctx.font = "46px Arial";
    ctx.fillText("Solar ROI Report", 50, 100);

    ctx.font = "32px Arial";
    ctx.fillText(`Name: ${name}`, 50, 180);
    ctx.fillText(`Avg EB Bill: ₹${bill.toLocaleString()}`, 50, 240);
    ctx.fillText(`Solar Cost: ₹${cost.toLocaleString()}`, 50, 300);
    ctx.fillText(`Subsidy: ₹${subsidy.toLocaleString()}`, 50, 360);
    ctx.fillText(`Net Investment: ₹${netCost.toLocaleString()}`, 50, 420);

    ctx.fillStyle = "#1a73e8";
    ctx.font = "36px Arial";
    ctx.fillText(`Breakeven in ${breakeven} years`, 50, 510);

    ctx.fillStyle = "#088000";
    ctx.font = "34px Arial";
    ctx.fillText(`Savings After Breakeven:`, 50, 590);
    ctx.fillText(`₹${Math.round(lifetimeSavings).toLocaleString()}`, 50, 640);

    ctx.fillStyle = "#444";
    ctx.font = "28px Arial";
    ctx.fillText(`Assumed EB Bill Increase: 4%/year`, 50, 720);
    ctx.fillText(`Solar Life: 25 Years`, 50, 760);

    const img = document.getElementById("outputImage");
    img.src = canvas.toDataURL("image/png");
    img.style.display = "block";
}
