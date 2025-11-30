// script.js
const generateBtn = document.getElementById('generate');
const downloadBtn = document.getElementById('download');
const reportSection = document.getElementById('report');

let chart = null;

function formatRupee(n) {
    return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function computeAndRender() {
    const name = (document.getElementById('name').value || 'Customer').trim();
    const bill = Number(document.getElementById('bill').value) || 0; // bi-monthly
    const cost = Number(document.getElementById('cost').value) || 0;
    const subsidy = Number(document.getElementById('subsidy').value) || 0;
    const inflation = Number(document.getElementById('inflation').value);

    // Basic validations
    if (!bill || !cost) {
        alert('Please enter Avg bi-monthly bill and system cost.');
        return;
    }

    // Calculations
    const yearlyBill = bill * 6; // 6 cycles per year
    const yearlySavingsYear1 = yearlyBill; // assuming solar offsets the bill fully
    const netInvestment = Math.max(0, cost - subsidy);

    // cumulative savings array over 25 years (year 1..25)
    const years = 25;
    const cumulative = [];
    let cum = 0;
    let eb = yearlyBill;
    for (let y = 1; y <= years; y++) {
        cum += eb;
        cumulative.push({ year: y, annual: eb, cumulative: Math.round(cum) });
        eb = eb * (1 + inflation);
    }

    // breakeven: first year where cumulative >= netInvestment
    let breakevenYear = cumulative.find(item => item.cumulative >= netInvestment);
    const breakeven = breakevenYear ? breakevenYear.year : null;

    // Total 25-year cumulative savings
    const total25 = cumulative[cumulative.length - 1].cumulative;

    // Profit after breakeven is total25 - netInvestment (if total25>netInvestment)
    const profitAfterBreakeven = Math.max(0, total25 - netInvestment);

    // ROI % over lifetime = (profitAfterBreakeven / netInvestment) *100
    const roiPercent = netInvestment > 0 ? (profitAfterBreakeven / netInvestment) * 100 : 0;

    // Fill report UI
    document.getElementById('rName').textContent = name;
    document.getElementById('rBill').textContent = formatRupee(bill);
    document.getElementById('rCost').textContent = formatRupee(cost);
    document.getElementById('rSubsidy').textContent = formatRupee(subsidy);
    document.getElementById('rNet').textContent = formatRupee(netInvestment);
    document.getElementById('rYear1').textContent = formatRupee(yearlySavingsYear1);
    document.getElementById('rTotal25').textContent = formatRupee(total25);
    document.getElementById('rProfit').textContent = formatRupee(profitAfterBreakeven);
    document.getElementById('rBreakYear').textContent = breakeven ? `${breakeven}` : '—';
    document.getElementById('rBreak').textContent = breakeven ? `Breakeven in ${breakeven} year${breakeven > 1 ? 's' : ''}` : 'No breakeven within 25 years';
    document.getElementById('rInflation').textContent = `${(inflation * 100).toFixed(1)}%`;
    document.getElementById('rROI').textContent = `${roiPercent.toFixed(1)}%`;

    // Chart: cumulative curve
    const labels = cumulative.map(c => `Yr ${c.year}`);
    const data = cumulative.map(c => c.cumulative);

    const ctx = document.getElementById('savingsChart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Cumulative Savings (₹)',
                data,
                fill: true,
                backgroundColor: 'rgba(11,132,87,0.12)',
                borderColor: 'rgba(11,132,87,0.95)',
                tension: 0.35,
                pointRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: { callback: (v) => v.toLocaleString('en-IN') }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // show report area
    reportSection.style.display = 'flex';
    reportSection.setAttribute('aria-hidden', 'false');

    // enable download button
    downloadBtn.disabled = false;
}

function downloadReportPNG() {
    // We'll render the report area (report element) to canvas via html2canvas-like manual draw:
    // Simpler approach: draw a custom canvas snapshot using the same data + chart image.

    // Prepare new canvas same as visible size
    const outCanvas = document.createElement('canvas');
    const w = 1080, h = 1350;
    outCanvas.width = w; outCanvas.height = h;
    const ctx = outCanvas.getContext('2d');

    // white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Left block
    ctx.fillStyle = '#111';
    ctx.font = '36px Inter, Arial';
    ctx.fillText('Solar ROI Report', 40, 80);

    ctx.font = '22px Inter, Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`Name: ${document.getElementById('rName').textContent}`, 40, 140);
    ctx.fillText(`Avg EB Bill (bi-monthly): ₹${document.getElementById('rBill').textContent}`, 40, 180);
    ctx.fillText(`Solar Cost: ₹${document.getElementById('rCost').textContent}`, 40, 220);
    ctx.fillText(`Subsidy: ₹${document.getElementById('rSubsidy').textContent}`, 40, 260);
    ctx.fillText(`Net Investment: ₹${document.getElementById('rNet').textContent}`, 40, 300);

    // Breakeven
    ctx.fillStyle = '#2b6feb';
    ctx.font = '28px Inter, Arial';
    ctx.fillText(document.getElementById('rBreak').textContent, 40, 360);

    // Profit after breakeven
    ctx.fillStyle = '#088000';
    ctx.font = '26px Inter, Arial';
    ctx.fillText('Savings After Breakeven:', 40, 420);
    ctx.font = '36px Inter, Arial';
    ctx.fillText(`₹${document.getElementById('rProfit').textContent}`, 40, 470);

    // Add chart snapshot by converting Chart to image
    const chartCanvas = document.getElementById('savingsChart');
    const chartImg = new Image();
    chartImg.src = chartCanvas.toDataURL('image/png');

    chartImg.onload = () => {
        // Draw chart on right side
        const chartX = 540;
        const chartY = 120;
        const chartW = 500;
        const chartH = 360;
        ctx.drawImage(chartImg, chartX, chartY, chartW, chartH);

        // Summary boxes
        ctx.fillStyle = '#f7f9fb';
        ctx.fillRect(chartX, chartY + chartH + 18, chartW, 140);
        ctx.fillStyle = '#333'; ctx.font = '20px Inter, Arial';
        ctx.fillText('Year 1 Savings:', chartX + 18, chartY + chartH + 55);
        ctx.fillText(`₹${document.getElementById('rYear1').textContent}`, chartX + chartW - 120, chartY + chartH + 55);

        ctx.fillText('Total 25-year Savings:', chartX + 18, chartY + chartH + 90);
        ctx.fillText(`₹${document.getElementById('rTotal25').textContent}`, chartX + chartW - 120, chartY + chartH + 90);

        ctx.fillText('ROI (%):', chartX + 18, chartY + chartH + 125);
        ctx.fillText(document.getElementById('rROI').textContent, chartX + chartW - 120, chartY + chartH + 125);

        // Trigger download
        const dataURL = outCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `Solar_ROI_${document.getElementById('rName').textContent || 'customer'}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };
}

generateBtn.addEventListener('click', computeAndRender);
downloadBtn.addEventListener('click', downloadReportPNG);
