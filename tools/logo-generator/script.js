document.addEventListener('DOMContentLoaded', function() {
    const companyNameInput = document.getElementById('companyName');
    const sloganInput = document.getElementById('slogan');
    const logoStyleSelect = document.getElementById('logoStyle');
    const primaryColorInput = document.getElementById('primaryColor');
    const secondaryColorInput = document.getElementById('secondaryColor');
    const fontFamilySelect = document.getElementById('fontFamily');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const logoPreview = document.getElementById('logoPreview');
    const logoCanvas = document.getElementById('logoCanvas');

    let ctx = logoCanvas.getContext('2d');

    function generateLogo() {
        const companyName = companyNameInput.value.trim();
        if (!companyName) {
            alert('Please enter a company name');
            return;
        }

        const slogan = sloganInput.value.trim();
        const style = logoStyleSelect.value;
        const primaryColor = primaryColorInput.value;
        const secondaryColor = secondaryColorInput.value;
        const fontFamily = fontFamilySelect.value;

        // Set canvas size
        logoCanvas.width = 400;
        logoCanvas.height = 200;

        // Clear canvas
        ctx.clearRect(0, 0, logoCanvas.width, logoCanvas.height);

        // Draw based on style
        if (style === 'modern') {
            drawModernLogo(companyName, slogan, primaryColor, secondaryColor, fontFamily);
        } else if (style === 'classic') {
            drawClassicLogo(companyName, slogan, primaryColor, secondaryColor, fontFamily);
        } else if (style === 'minimal') {
            drawMinimalLogo(companyName, slogan, primaryColor, secondaryColor, fontFamily);
        }

        logoPreview.style.display = 'block';
        downloadBtn.style.display = 'inline-block';
    }

    function drawModernLogo(name, slogan, primaryColor, secondaryColor, fontFamily) {
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, logoCanvas.width, logoCanvas.height);
        gradient.addColorStop(0, primaryColor + '20');
        gradient.addColorStop(1, secondaryColor + '20');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);

        // Company name
        ctx.fillStyle = primaryColor;
        ctx.font = `bold 36px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText(name, logoCanvas.width / 2, logoCanvas.height / 2 - 10);

        // Slogan
        if (slogan) {
            ctx.fillStyle = secondaryColor;
            ctx.font = `16px ${fontFamily}`;
            ctx.fillText(slogan, logoCanvas.width / 2, logoCanvas.height / 2 + 30);
        }

        // Decorative element
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(logoCanvas.width / 2 - 50, logoCanvas.height / 2 + 50);
        ctx.lineTo(logoCanvas.width / 2 + 50, logoCanvas.height / 2 + 50);
        ctx.stroke();
    }

    function drawClassicLogo(name, slogan, primaryColor, secondaryColor, fontFamily) {
        // Border
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, logoCanvas.width - 40, logoCanvas.height - 40);

        // Company name
        ctx.fillStyle = primaryColor;
        ctx.font = `bold 32px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText(name, logoCanvas.width / 2, logoCanvas.height / 2 - 5);

        // Slogan
        if (slogan) {
            ctx.fillStyle = secondaryColor;
            ctx.font = `14px ${fontFamily}`;
            ctx.fillText(slogan, logoCanvas.width / 2, logoCanvas.height / 2 + 25);
        }
    }

    function drawMinimalLogo(name, slogan, primaryColor, secondaryColor, fontFamily) {
        // Simple background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);

        // Company name
        ctx.fillStyle = primaryColor;
        ctx.font = `300 28px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.fillText(name, logoCanvas.width / 2, logoCanvas.height / 2);

        // Slogan
        if (slogan) {
            ctx.fillStyle = secondaryColor;
            ctx.font = `300 12px ${fontFamily}`;
            ctx.fillText(slogan, logoCanvas.width / 2, logoCanvas.height / 2 + 25);
        }
    }

    function downloadLogo() {
        const link = document.createElement('a');
        link.download = `${companyNameInput.value.trim() || 'logo'}.png`;
        link.href = logoCanvas.toDataURL();
        link.click();
    }

    generateBtn.addEventListener('click', generateLogo);
    downloadBtn.addEventListener('click', downloadLogo);

    // Set default values
    companyNameInput.placeholder = 'Enter your company name';
    sloganInput.placeholder = 'Enter your slogan (optional)';
});
