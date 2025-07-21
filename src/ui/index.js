import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

addOnUISdk.ready.then(async () => {
    console.log("addOnUISdk is ready for use.");
    // Get the UI runtime.
    const { runtime } = addOnUISdk.instance;
    // Get the proxy object, which is required to call the APIs defined in the Document Sandbox runtime
    // i.e., in the `code.js` file of this add-on.
    const sandboxProxy = await runtime.apiProxy("documentSandbox");

    // --- Get elements ---
    const customPromptInput = document.getElementById("custom-prompt");
    const analysisOutput = document.getElementById("analysis-output");
    const imageContainer = document.getElementById("image-container");
    const analysisContainer = document.getElementById("analysis-container");
    const formalityScale = document.getElementById("formality-scale");
    const formalityDisplay = document.getElementById("formality-display");

    // Get all form inputs with new IDs
    const productServiceInput = document.getElementById("product-service");
    const industryInput = document.getElementById("industry");
    const targetDemographicInput = document.getElementById("target-demographic");
    const analyzeButton = document.getElementById("analyze-button");
    const sectionSelector = document.getElementById("section-selector");
    const designAnalyzerSection = document.getElementById("design-analyzer-section");
    const captionGeneratorSection = document.getElementById("caption-generator-section");
    const campaignGeneratorSection = document.getElementById("campaign-generator-section");
    const autoFillButtonDesign = document.getElementById("autofill-button-design");
    const autoFillButtonCaption = document.getElementById("autofill-button-caption");
    const autoFillButtonCampaign = document.getElementById("autofill-button-campaign");
    const captionButton = document.getElementById("caption-button");
    // Caption form fields
    const captionForm = document.getElementById("caption-form");
    const captionToneInput = document.getElementById("caption-tone");
    const captionTargetAudienceInput = document.getElementById("caption-target-audience");
    const captionEmojiInput = document.getElementById("caption-emoji");
    const captionHashtagsInput = document.getElementById("caption-hashtags");
    const captionPlatformInputs = document.querySelectorAll(".caption-platform");
    const campaignButton = document.getElementById("campaign-button");
    const createMockupToggle = document.getElementById("create-mockup-toggle");
    const exportButtons = document.getElementById("export-buttons");
    const exportTxtButton = document.getElementById("export-txt-button");

    // --- Injected styles for better UI ---
    const style = document.createElement('style');
    style.textContent = `
        .score-container {
            text-align: center;
            margin-bottom: 8px;
        }
        .score-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
            position: relative;
            background: conic-gradient(#7c3aed var(--score-angle, 0deg), #ede9fe 0deg);
            transition: --score-angle 1s ease-in-out;
        }
        .score-circle::before {
            content: '';
            position: absolute;
            left: 8px;
            top: 8px;
            right: 8px;
            bottom: 8px;
            background: #fff;
            border-radius: 50%;
        }
        .score-value {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #1f2937;
            z-index: 2;
            pointer-events: none;
        }
        .score-total {
            font-weight: 500;
            color: #4b5563;
            margin-top: -2px;
        }
        .analysis-suggestions {
            padding: 0 16px
            text-align: justify;
            font-family: inherit;
            font-size: 15px;
            line-height: 1.6;
            color: #374151;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .analysis-suggestions p,
        .analysis-suggestions ul,
        .analysis-suggestions ol {
            margin: 0 0 8px 0;
            padding: 0;
        }
        .analysis-suggestions ul {
            padding-left: 0;
            list-style-position: outside;
            margin-left: 16px;
        }
        .analysis-suggestions li {
            margin: 4px 0;
            padding-left: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .campaign-results {
            padding: 8px;
            text-align: left;
        }
        .campaign-results h2 {
            font-size: 1.3em;
            color: #7c3aed;
            margin-bottom: 12px;
            border-bottom: 2px solid #ede9fe;
            padding-bottom: 6px;
        }
        .campaign-results h3 {
            font-size: 1.1em;
            color: #1f2937;
            margin-top: 16px;
            margin-bottom: 8px;
        }
        .campaign-results p, .campaign-results ul {
            color: #374151;
            line-height: 1.6;
            margin-bottom: 12px;
        }
        .campaign-results ul {
            list-style-position: inside;
            padding-left: 8px;
        }
        .campaign-results .pr-angle, .campaign-results .creative-hook {
            background-color: #f9fafb;
            border-left: 4px solid #7c3aed;
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 0 4px 4px 0;
            margin: 16px 0;
            padding: 12px 16px;
            font-size: 14px;
            color: #7c3aed;
            font-weight: 500;
            background: rgba(124, 58, 237, 0.04);
            border: 1px solid rgba(124, 58, 237, 0.1);
        }
        .generating-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
            animation: spin 2s linear infinite;
            flex-shrink: 0;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        /* Scanning animation overlay styles */
        .scanning-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            border-radius: 8px;
            overflow: hidden;
        }
        .scanning-overlay::before {
            content: '';
            position: absolute;
            top: 0;
            left: -60%;
            width: 60%;
            height: 100%;
            background: linear-gradient(90deg, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.18) 50%, rgba(124,58,237,0.08) 100%);
            animation: scan-move 1.2s linear infinite;
        }
        @keyframes scan-move {
            0% { left: -60%; }
            100% { left: 100%; }
        }
    `;
    document.head.appendChild(style);


    const GROQ_API_KEY = "YOUR_GROQ_API_KEY";
    const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

    let originalImageBase64 = null;
    let analysisText = "";
    let storedFormData = null;

    // Update formality display when scale changes with better descriptions
    const formalityDescriptions = {
        1: "Casual",
        2: "Friendly", 
        3: "Balanced",
        4: "Professional",
        5: "Formal"
    };

    formalityScale.addEventListener("input", (e) => {
        const level = e.target.value;
        formalityDisplay.textContent = formalityDescriptions[level];
    });

    // Tab switching logic
    const tabForm = document.getElementById("tab-form");
    const tabAnalysis = document.getElementById("tab-analysis");
    const formTabContent = document.getElementById("form-tab-content");
    const analysisTabContent = document.getElementById("analysis-tab-content");

    // --- Section Switching Logic ---
    sectionSelector.addEventListener("change", (e) => {
        const selectedValue = e.target.value;
        designAnalyzerSection.style.display = selectedValue === "design-analyzer" ? "block" : "none";
        captionGeneratorSection.style.display = selectedValue === "caption-generator" ? "block" : "none";
        campaignGeneratorSection.style.display = selectedValue === "campaign-generator" ? "block" : "none";
    });

    function switchTab(tab) {
        if (tab === "form") {
            tabForm.classList.add("active");
            tabAnalysis.classList.remove("active");
            formTabContent.classList.add("active");
            analysisTabContent.classList.remove("active");
        } else {
            tabForm.classList.remove("active");
            tabAnalysis.classList.add("active");
            formTabContent.classList.remove("active");
            analysisTabContent.classList.add("active");
        }
    }

    tabForm.addEventListener("click", () => switchTab("form"));
    tabAnalysis.addEventListener("click", () => switchTab("analysis"));

    function showExportOptions() {
        exportButtons.style.display = "block";
    }

    function hideExportOptions() {
        exportButtons.style.display = "none";
    }

    function exportToTxt() {
        const content = analysisOutput.innerText;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const selectedOption = sectionSelector.options[sectionSelector.selectedIndex].text.replace(/ /g, "");
        link.download = `${selectedOption}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    exportTxtButton.addEventListener("click", exportToTxt);

    // --- Design Analyzer and Caption Generator logic restored from old code ---
    async function setupAnalysisView(loadingText) {
        switchTab("analysis");
        hideExportOptions();

        const renditionOptions = {
            range: addOnUISdk.constants.Range.currentPage,
            format: addOnUISdk.constants.RenditionFormat.png,
        };
        const renditions = await addOnUISdk.app.document.createRenditions(
            renditionOptions,
            addOnUISdk.constants.RenditionIntent.preview
        );
        if (renditions.length === 0) {
            throw new Error("Could not create a rendition of the current page.");
        }
        const rendition = renditions[0];
        const imageBase64 = await blobToBase64(rendition.blob);

        // Clear previous results and show current design
        imageContainer.innerHTML = "";
        analysisOutput.innerHTML = "";
        imageContainer.style.display = "block";
        analysisContainer.style.display = "block";

        const originalImageWrapper = document.createElement("div");
        originalImageWrapper.style.marginBottom = "16px";
        originalImageWrapper.style.position = "relative";
        const originalCaption = document.createElement("div");
        originalCaption.className = "image-caption";
        originalCaption.textContent = "Current Design";
        originalCaption.style.marginTop = "0";
        originalCaption.style.marginBottom = "8px";
        const originalImg = document.createElement("img");
        originalImg.src = URL.createObjectURL(rendition.blob);
        originalImg.style.maxWidth = "100%";
        originalImg.style.borderRadius = "8px";
        originalImg.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
        originalImageWrapper.appendChild(originalCaption);
        originalImageWrapper.appendChild(originalImg);

        // Add scanning animation overlay
        const scanningOverlay = document.createElement("div");
        scanningOverlay.className = "scanning-overlay";
        scanningOverlay.style.position = "absolute";
        scanningOverlay.style.top = "0";
        scanningOverlay.style.left = "0";
        scanningOverlay.style.right = "0";
        scanningOverlay.style.bottom = "0";
        scanningOverlay.style.pointerEvents = "none";
        originalImageWrapper.appendChild(scanningOverlay);

        imageContainer.appendChild(originalImageWrapper);

        analysisOutput.innerHTML = `<div class='loading-spinner'><div class='spinner'></div></div><div style='text-align:center;color:#7c3aed;font-weight:500;'>${loadingText}</div>`;

        return { imageBase64, originalImageWrapper };
    }

    // Restore autofill for design analyzer
    function handleAutoFillDesignClick(event) {
        const button = event.currentTarget;
        button.textContent = "Analyzing Image...";
        button.disabled = true;
        (async () => {
            try {
                const renditionOptions = {
                    range: addOnUISdk.constants.Range.currentPage,
                    format: addOnUISdk.constants.RenditionFormat.png
                };
                const renditions = await addOnUISdk.app.document.createRenditions(
                    renditionOptions,
                    addOnUISdk.constants.RenditionIntent.preview
                );
                if (renditions.length === 0) {
                    throw new Error("Could not create a rendition of the current page.");
                }
                const imageBase64 = await blobToBase64(renditions[0].blob);
                const analysis = await callGroqApi(imageBase64);
                if (analysis) {
                    productServiceInput.value = analysis.productService || "";
                    industryInput.value = analysis.industry || "";
                    targetDemographicInput.value = analysis.targetDemographic || "";
                }
            } catch (error) {
                console.error("Autofill failed:", error);
            } finally {
                button.textContent = "Autofill with AI";
                button.disabled = false;
            }
        })();
    }
    autoFillButtonDesign && autoFillButtonDesign.addEventListener("click", handleAutoFillDesignClick);

    // Restore autofill for caption generator
    function handleAutoFillCaptionClick(event) {
        const button = event.currentTarget;
        button.textContent = "Analyzing Image...";
        button.disabled = true;
        (async () => {
            try {
                const renditionOptions = {
                    range: addOnUISdk.constants.Range.currentPage,
                    format: addOnUISdk.constants.RenditionFormat.png
                };
                const renditions = await addOnUISdk.app.document.createRenditions(
                    renditionOptions,
                    addOnUISdk.constants.RenditionIntent.preview
                );
                if (renditions.length === 0) {
                    throw new Error("Could not create a rendition of the current page.");
                }
                const imageBase64 = await blobToBase64(renditions[0].blob);
                const analysis = await callGroqApi(imageBase64);
                if (analysis) {
                    // Fill productService, industry, targetDemographic if present
                    if (productServiceInput && analysis.productService) productServiceInput.value = analysis.productService;
                    if (industryInput && analysis.industry) industryInput.value = analysis.industry;
                    if (targetDemographicInput && analysis.targetDemographic) targetDemographicInput.value = analysis.targetDemographic;
                    // Fill tone and target audience if present
                    if (captionToneInput && analysis.tone) captionToneInput.value = analysis.tone;
                    if (captionTargetAudienceInput && analysis.targetDemographic) captionTargetAudienceInput.value = analysis.targetDemographic;
                    // Optionally autofill emoji/hashtags/platforms if present in analysis
                    if (typeof analysis.emoji === 'boolean' && captionEmojiInput) captionEmojiInput.checked = analysis.emoji;
                    if (typeof analysis.hashtags === 'boolean' && captionHashtagsInput) captionHashtagsInput.checked = analysis.hashtags;
                    if (Array.isArray(analysis.selectedPlatforms) && captionPlatformInputs) {
                        captionPlatformInputs.forEach(input => {
                            input.checked = analysis.selectedPlatforms.includes(input.value);
                        });
                    }
                }
            } catch (error) {
                console.error("Autofill failed:", error);
            } finally {
                button.textContent = "Autofill with AI";
                button.disabled = false;
            }
        })();
    }
    autoFillButtonCaption && autoFillButtonCaption.addEventListener("click", handleAutoFillCaptionClick);
    analyzeButton.addEventListener("click", async event => {
        hideExportOptions();
        try {
            analyzeButton.textContent = "Analyzing...";
            analyzeButton.disabled = true;

            const formData = {
                productService: productServiceInput.value.trim(),
                industry: industryInput.value.trim(),
                targetDemographic: targetDemographicInput.value.trim(),
                formalityLevel: parseInt(formalityScale.value),
                customPrompt: customPromptInput.value.trim()
            };

            if (!formData.productService || !formData.industry || !formData.targetDemographic) {
                alert("Please fill in all required fields (Product/Service, Industry, Target Demographic)");
                analyzeButton.textContent = "Analyze & Optimize";
                analyzeButton.disabled = false;
                return;
            }

            const { imageBase64, originalImageWrapper } = await setupAnalysisView("Analyzing your design...");

            originalImageBase64 = imageBase64;
            storedFormData = formData;

            // Remove scanning animation overlay when analysis is done (handled later)
            const scanningOverlay = originalImageWrapper.querySelector('.scanning-overlay');
            if (scanningOverlay) {
                scanningOverlay.style.display = 'block';
            }

            // Show only spinner and analyzing design text during analysis
            analysisOutput.innerHTML = `
                <div style='display:flex;justify-content:center;align-items:center;margin:32px 0;'>
                    <span class='generating-icon'></span>
                    <span style='color:#7c3aed;font-weight:500;font-size:1.2em;'>Analyzing design...</span>
                </div>
            `;

            // Run all three analyses in parallel
            const [colorAnalysis, hierarchyAnalysis, demographicAnalysis] = await Promise.all([
                analyzePsychologicalColors(originalImageBase64, formData),
                analyzeVisualHierarchy(originalImageBase64, formData),
                analyzeDemographicImpact(originalImageBase64, formData)
            ]);

            // Combine instructions for getModificationSteps
            const combinedInstructions = `Psychological Color Analysis:\n${colorAnalysis}\n\nVisual Hierarchy & Design Cohesiveness:\n${hierarchyAnalysis}\n\nTarget Demographic Impact:\n${demographicAnalysis}`;

            // Call getModificationSteps with combined instructions
            const analysisResult = await getModificationSteps(originalImageBase64, { ...formData, combinedInstructions });

            // Remove scanning animation overlay after analysis is done
            if (scanningOverlay) {
                scanningOverlay.style.display = 'none';
            }

            // Show all results in a compact, cohesive layout with score circle
            if (analysisResult) {
                const suggestions = analysisResult.displaySuggestions ? analysisResult.displaySuggestions.trim() : '';
                analysisOutput.innerHTML = `
                    <div class="analysis-content" style="margin-top:2px;padding:0 8px;max-width:420px;margin-left:auto;margin-right:auto;">
                        <div class="score-container" style="margin-bottom:2px;">
                            <div class="score-circle" style="width:100px;height:100px;margin:0 auto;--score-angle:${(analysisResult.designScore/10)*360}deg;position:relative;">
                                <span class="score-value" style="font-size:2.4em;font-weight:700;letter-spacing:-1px;display:flex;flex-direction:row;align-items:center;justify-content:center;width:100%;height:100%;gap:6px;">
                                    <span style="">${analysisResult.designScore}</span>
                                    <span class="score-total" style="font-size:0.6em;font-weight:500;color:#4b5563;">/10</span>
                                </span>
                            </div>
                        </div>
                        <div class="analysis-suggestions" style="margin-bottom:2px;padding:0 2px;">${marked.parse(suggestions)}</div>
                        <div class="analysis-section" id="color-analysis-section" style="margin-bottom:10px;">
                            <h4 style="color:#7c3aed;margin-bottom:2px;font-size:1em;">Psychological Color Analysis</h4>
                            <div class="analysis-text" style="font-size:0.97em;">${marked.parse(colorAnalysis)}</div>
                        </div>
                        <div class="analysis-section" id="hierarchy-analysis-section" style="margin-bottom:10px;">
                            <h4 style="color:#7c3aed;margin-bottom:2px;font-size:1em;">Visual Hierarchy & Design Cohesiveness</h4>
                            <div class="analysis-text" style="font-size:0.97em;">${marked.parse(hierarchyAnalysis)}</div>
                        </div>
                        <div class="analysis-section" id="demographic-analysis-section" style="margin-bottom:10px;">
                            <h4 style="color:#7c3aed;margin-bottom:2px;font-size:1em;">Target Demographic Impact</h4>
                            <div class="analysis-text" style="font-size:0.97em;">${marked.parse(demographicAnalysis)}</div>
                        </div>
                    </div>
                `;

                // Show spinner while generating improved design
                const spinnerDiv = document.createElement('div');
                spinnerDiv.style.display = 'flex';
                spinnerDiv.style.justifyContent = 'center';
                spinnerDiv.style.alignItems = 'center';
                spinnerDiv.style.margin = '12px 0';
                spinnerDiv.innerHTML = `<span class='generating-icon'></span><span style='color:#7c3aed;font-weight:500;'>Generating improved design...</span>`;
                analysisOutput.appendChild(spinnerDiv);

                // Pass designer instructions to image generation AI
                const result = await applyModifications(originalImageBase64, analysisResult.designerInstructions);
                spinnerDiv.remove();
                if (result && result.modifiedImage) {
                    const improvedImageWrapper = document.createElement("div");
                    improvedImageWrapper.style.marginBottom = "10px";
                    improvedImageWrapper.style.marginTop = "0";
                    const improvedCaption = document.createElement("div");
                    improvedCaption.className = "image-caption";
                    improvedCaption.textContent = "Suggested Improvements";
                    improvedCaption.style.marginTop = "0";
                    improvedCaption.style.marginBottom = "6px";
                    const improvedImg = document.createElement("img");
                    improvedImg.src = result.modifiedImage;
                    improvedImg.style.maxWidth = "100%";
                    improvedImg.style.borderRadius = "8px";
                    improvedImg.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    improvedImageWrapper.appendChild(improvedCaption);
                    improvedImageWrapper.appendChild(improvedImg);
                    imageContainer.appendChild(improvedImageWrapper);

                    showDownloadOptions(result.modifiedImage);
                } else {
                    analysisOutput.textContent += "\n\nFailed to apply improvements.";
                }
            } else {
                analysisOutput.textContent = "Analysis failed. Please try again.";
            }
// --- Gemini 2.5 Pro Analysis Functions ---
async function analyzePsychologicalColors(imageBase64, formData) {
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
    const prompt = `You are a color psychology expert. Analyze the provided image for its psychological color impact in marketing. Consider the product/service, industry, and target demographic. Return ONLY a concise summary and actionable suggestions as plain text.`;
    const context = formData.productService && formData.industry && formData.targetDemographic
        ? `\nProduct/Service: ${formData.productService}\nIndustry: ${formData.industry}\nTarget Demographic: ${formData.targetDemographic}`
        : "";
    const payload = {
        contents: [{
            parts: [
                { text: prompt + context },
                { inlineData: { mimeType: "image/png", data: imageBase64.split(',')[1] } }
            ]
        }],
        generation_config: { responseModalities: ["Text"] }
    };
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}

async function analyzeVisualHierarchy(imageBase64, formData) {
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
    const prompt = `You are a design expert. Analyze the image for visual hierarchy and design cohesiveness. Consider layout, spacing, alignment, and consistency. Return ONLY a concise summary and actionable suggestions as plain text.`;
    const context = formData.productService && formData.industry && formData.targetDemographic
        ? `\nProduct/Service: ${formData.productService}\nIndustry: ${formData.industry}\nTarget Demographic: ${formData.targetDemographic}`
        : "";
    const payload = {
        contents: [{
            parts: [
                { text: prompt + context },
                { inlineData: { mimeType: "image/png", data: imageBase64.split(',')[1] } }
            ]
        }],
        generation_config: { responseModalities: ["Text"] }
    };
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}

async function analyzeDemographicImpact(imageBase64, formData) {
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
    const prompt = `You are a marketing psychologist. Analyze the image for its impact on the target demographic. Consider emotional appeal, relevance, and resonance. Return ONLY a concise summary and actionable suggestions as plain text.`;
    const context = formData.productService && formData.industry && formData.targetDemographic
        ? `\nProduct/Service: ${formData.productService}\nIndustry: ${formData.industry}\nTarget Demographic: ${formData.targetDemographic}`
        : "";
    const payload = {
        contents: [{
            parts: [
                { text: prompt + context },
                { inlineData: { mimeType: "image/png", data: imageBase64.split(',')[1] } }
            ]
        }],
        generation_config: { responseModalities: ["Text"] }
    };
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}
        } catch (error) {
            console.log("Failed to analyze image:", error);
            analysisOutput.textContent = "An error occurred during analysis. Please try again.";
        } finally {
            analyzeButton.textContent = "Analyze & Optimize";
            analyzeButton.disabled = false;
        }
    });

    captionButton.addEventListener("click", async () => {
        // Gather extra caption form data
        const tone = captionToneInput.value.trim();
        const targetAudience = captionTargetAudienceInput.value.trim();
        const emoji = captionEmojiInput.checked;
        const hashtags = captionHashtagsInput.checked;
        const selectedPlatforms = Array.from(captionPlatformInputs)
            .filter(input => input.checked)
            .map(input => input.value);

        await handleGenericAction(
            captionButton,
            "Generating Captions...",
            async (imageBase64, formData) => {
                // Pass extra fields to getCaptions
                return await getCaptions(imageBase64, {
                    ...formData,
                    tone,
                    targetAudience,
                    emoji,
                    hashtags,
                    selectedPlatforms
                });
            },
            "Generate Captions",
            {
                tone,
                targetAudience,
                emoji,
                hashtags,
                selectedPlatforms
            }
        );
    });

    campaignButton.addEventListener("click", async () => {
        const influencerLocationInput = document.getElementById("influencer-location");
        let influencerLocation = influencerLocationInput ? influencerLocationInput.value : "Worldwide";
        if (influencerLocation === "Other") {
            const customLocationInput = document.getElementById("custom-influencer-location");
            if (customLocationInput && customLocationInput.value.trim()) {
                influencerLocation = customLocationInput.value.trim();
            }
        }
        // Custom logic: handle campaign and mockup
        campaignButton.textContent = "Generating Campaign...";
        campaignButton.disabled = true;
        try {
            const formData = {
                productService: productServiceInput.value.trim(),
                industry: industryInput.value.trim(),
                targetDemographic: targetDemographicInput.value.trim(),
                customPrompt: customPromptInput.value.trim(),
                influencerLocation
            };
            if (!formData.productService || !formData.industry || !formData.targetDemographic) {
                alert("Please fill in all required fields (Product/Service, Industry, Target Demographic)");
                campaignButton.textContent = "Generate Campaign";
                campaignButton.disabled = false;
                return;
            }
            const { imageBase64, originalImageWrapper } = await setupAnalysisView("Generating campaign...");
            const campaignData = await getCampaignWithInfluencers(imageBase64, formData);
            // Remove scanning animation overlay after campaign analysis is rendered
            if (originalImageWrapper) {
                const scanningOverlay = originalImageWrapper.querySelector('.scanning-overlay');
                if (scanningOverlay) scanningOverlay.remove();
            }
            if (campaignData) {
                // Show analysis immediately
                analysisOutput.innerHTML = '';
                const analysisDiv = document.createElement('div');
                analysisDiv.className = 'fade-in';
                analysisDiv.innerHTML = renderCampaignResults(campaignData);
                analysisOutput.appendChild(analysisDiv);
                showExportOptions();
                // If mockup toggle is checked, generate mockup asynchronously (no loading text)
                if (createMockupToggle && createMockupToggle.checked) {
                    generateCampaignMockup(campaignData, imageBase64);
                }
            } else {
                analysisOutput.innerHTML = "<span style='color:red;'>Failed to generate campaign.</span>";
            }
        } catch (error) {
            analysisOutput.innerHTML = `<span style='color:red;'>Error: ${error.message}</span>`;
        } finally {
            campaignButton.textContent = "Generate Campaign";
            campaignButton.disabled = false;
        }
    });
    // Generate a mockup for the campaign if requested
    async function generateCampaignMockup(campaignData, imageBase64) {
        // Use campaignData.bigIdea or campaignData.campaignName as prompt
        const prompt = campaignData.bigIdea || campaignData.campaignName || "";
        // Add loader at the top of analysisOutput
        const loaderDiv = document.createElement('div');
        loaderDiv.id = 'mockup-loader';
        loaderDiv.style.display = 'flex';
        loaderDiv.style.alignItems = 'center';
        loaderDiv.style.justifyContent = 'center';
        loaderDiv.style.marginBottom = '16px';
        loaderDiv.innerHTML = `<span class='generating-icon'></span><span style='color:#7c3aed;font-weight:500;'>Generating mockup...</span>`;
        analysisOutput.prepend(loaderDiv);
        try {
            // Use Gemini 2.0 Flash image generation API (like applyModifications)
            const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent";
            const mockupPrompt = `Generate a visually compelling marketing mockup for the following campaign.\n\nGuidelines:\n- The mockup should visually represent the campaign's big idea and creative hooks.\n- Do NOT add, change, remove, obscure, or distort any text, brand name, or logo from the original image.\n- Do NOT generate or overlay any new text or graphical elements containing text.\n- Focus only on modifying non-text, non-logo design elements such as background, color palette, lighting, layout spacing, imagery, and visual effects.\n- All changes must align with the campaign's concept.\n\nCampaign Details:\n${prompt}`;
            const payload = {
                contents: [{
                    parts: [
                        { text: mockupPrompt },
                        { inlineData: { mimeType: "image/png", data: imageBase64.split(',')[1] } }
                    ]
                }],
                generation_config: {
                    responseModalities: ["Image", "Text"]
                }
            };
            const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini API request failed: ${errorBody}`);
            }
            const result = await response.json();
            // Find the image part in the response
            const imagePart = result.candidates[0]?.content?.parts?.find(part => part.inlineData && part.inlineData.mimeType.startsWith("image/"));
            const mockupDiv = document.createElement("div");
            mockupDiv.style.marginTop = "16px";
            mockupDiv.innerHTML = `<h4>Campaign Mockup</h4>`;
            let mockupImgDataUrl = null;
            if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
                mockupImgDataUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                const img = document.createElement("img");
                img.src = mockupImgDataUrl;
                img.alt = "Campaign Mockup";
                img.style.maxWidth = "100%";
                img.style.borderRadius = "8px";
                mockupDiv.appendChild(img);
                // Add download options directly below the mockup image (after the image)
                const downloadOptionsDiv = document.createElement("div");
                downloadOptionsDiv.style.marginTop = "10px";
                mockupDiv.appendChild(downloadOptionsDiv);
                showDownloadOptions(mockupImgDataUrl, downloadOptionsDiv);
            } else {
                mockupDiv.innerHTML += `<div style='color:#7c3aed;'>[No mockup image returned. Prompt used: <b>${prompt}</b>]</div>`;
            }
            // Remove loader and insert mockup at the top
            if (loaderDiv) loaderDiv.remove();
            analysisOutput.prepend(mockupDiv);
        } catch (err) {
            if (loaderDiv) loaderDiv.remove();
            analysisOutput.innerHTML += `<div style='color:red;'>Failed to generate mockup: ${err.message}</div>`;
        }
    }

    async function handleGenericAction(button, loadingText, actionFunction, buttonText, extraFields = {}) {
        try {
            button.textContent = loadingText;
            button.disabled = true;

            const formData = {
                productService: productServiceInput.value.trim(),
                industry: industryInput.value.trim(),
                targetDemographic: targetDemographicInput.value.trim(),
                ...extraFields
            };

            if (!formData.productService || !formData.industry || !formData.targetDemographic) {
                alert("Please fill in all required fields (Product/Service, Industry, Target Demographic)");
                button.textContent = buttonText;
                button.disabled = false;
                return;
            }

            const { imageBase64 } = await setupAnalysisView(loadingText);

            const result = await actionFunction(imageBase64, formData);

            // Remove scanning animation when processing is complete
            const scanningOverlay = document.querySelector('.scanning-overlay');
            if (scanningOverlay) {
                scanningOverlay.remove();
            }

            // If this is for captions, handle JSON string or object robustly
            if (button === captionButton) {
                let captionsObj = null;
                if (result && typeof result === 'object' && result.captions) {
                    captionsObj = result.captions;
                } else if (typeof result === 'object' && !Array.isArray(result)) {
                    // Sometimes Gemini may return the object directly
                    captionsObj = result;
                } else if (typeof result === 'string') {
                    // Try to parse JSON string, even if wrapped in code block
                    let trimmed = result.trim();
                    // Remove markdown code block if present
                    if (trimmed.startsWith('```json')) {
                        trimmed = trimmed.replace(/^```json[\r\n]+/, '').replace(/```\s*$/, '').trim();
                    } else if (trimmed.startsWith('```')) {
                        trimmed = trimmed.replace(/^```[\w]*[\r\n]+/, '').replace(/```\s*$/, '').trim();
                    }
                    // Now try to parse
                    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                        try {
                            captionsObj = JSON.parse(trimmed);
                        } catch (e) {
                            captionsObj = null;
                        }
                    }
                }
                if (captionsObj && typeof captionsObj === 'object' && !Array.isArray(captionsObj)) {
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'fade-in';
                    resultDiv.innerHTML = renderCaptionsWithIcons(captionsObj);
                    analysisOutput.innerHTML = '';
                    analysisOutput.appendChild(resultDiv);
                    showExportOptions();
                } else if (result) {
                    // Fallback for plain text result
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'fade-in';
                    resultDiv.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit; margin: 0; padding: 0;">${result}</pre>`;
                    analysisOutput.innerHTML = '';
                    analysisOutput.appendChild(resultDiv);
                    showExportOptions();
                } else {
                    analysisOutput.innerHTML = `<div class='fade-in' style='text-align: center; color: #ef4444; margin-top: 16px; padding: 12px; background: rgba(239, 68, 68, 0.04); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.1);'>${buttonText} failed. Please try again.</div>`;
                }
            } else if (button === campaignButton) {
                // Handle structured JSON for campaign results
                if (result && typeof result === 'object') {
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'fade-in';
                    resultDiv.innerHTML = renderCampaignResults(result);
                    analysisOutput.innerHTML = '';
                    analysisOutput.appendChild(resultDiv);
                    showExportOptions();
                } else if (result) { // Fallback for plain text
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'fade-in';
                    resultDiv.innerHTML = marked.parse(result);
                    analysisOutput.innerHTML = '';
                    analysisOutput.appendChild(resultDiv);
                    showExportOptions();
                } else {
                    analysisOutput.innerHTML = `<div class='fade-in' style='text-align: center; color: #ef4444; margin-top: 16px; padding: 12px; background: rgba(239, 68, 68, 0.04); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.1);'>${buttonText} failed. Please try again.</div>`;
                }
            } else if (result) {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'fade-in';
                resultDiv.innerHTML = marked.parse(result);
                analysisOutput.innerHTML = '';
                analysisOutput.appendChild(resultDiv);
                showExportOptions();
            } else {
                analysisOutput.innerHTML = `<div class='fade-in' style='text-align: center; color: #ef4444; margin-top: 16px; padding: 12px; background: rgba(239, 68, 68, 0.04); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.1);'>${buttonText} failed. Please try again.</div>`;
            }
        } catch (error) {
            console.error(`Failed to ${buttonText.toLowerCase()}:`, error);
            analysisOutput.textContent = `An error occurred. Please try again.`;
        } finally {
            button.textContent = buttonText;
            button.disabled = false;
        }
    }

    // Restore autofill for campaign generator
    function handleAutoFillCampaignClick(event) {
        const button = event.currentTarget;
        button.textContent = "Analyzing Image...";
        button.disabled = true;
        (async () => {
            try {
                const renditionOptions = {
                    range: addOnUISdk.constants.Range.currentPage,
                    format: addOnUISdk.constants.RenditionFormat.png
                };
                const renditions = await addOnUISdk.app.document.createRenditions(
                    renditionOptions,
                    addOnUISdk.constants.RenditionIntent.preview
                );
                if (renditions.length === 0) {
                    throw new Error("Could not create a rendition of the current page.");
                }
                const imageBase64 = await blobToBase64(renditions[0].blob);
                const analysis = await callGroqApi(imageBase64);
                if (analysis) {
                    productServiceInput.value = analysis.productService || "";
                    industryInput.value = analysis.industry || "";
                    targetDemographicInput.value = analysis.targetDemographic || "";
                }
            } catch (error) {
                console.error("Failed to auto-fill campaign form:", error);
                alert("An error occurred while trying to auto-fill the campaign form. Please check the console for details.");
            } finally {
                button.textContent = "✨ Auto-fill with AI";
                button.disabled = false;
            }
        })();
    }
    autoFillButtonCampaign && autoFillButtonCampaign.addEventListener("click", handleAutoFillCampaignClick);

    // Add Influencer Marketing Location dropdown to campaign generator section
    if (campaignGeneratorSection) {
        const influencerLabel = document.createElement("label");
        influencerLabel.htmlFor = "influencer-location";
        influencerLabel.textContent = "Influencer Marketing Location:";
        influencerLabel.style.display = "block";
        influencerLabel.style.margin = "12px 0 4px 0";
        const influencerLocationInput = document.createElement("select");
        influencerLocationInput.id = "influencer-location";
        influencerLocationInput.style.margin = "8px 0";
        influencerLocationInput.style.padding = "6px 12px";
        influencerLocationInput.style.borderRadius = "6px";
        influencerLocationInput.style.fontSize = "1rem";
        influencerLocationInput.style.border = "1px solid #d1d5db";
        influencerLocationInput.style.background = "#fff";
        influencerLocationInput.style.width = "100%";
        influencerLocationInput.innerHTML = `
            <option value="Worldwide">Worldwide</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="India">India</option>
            <option value="Australia">Australia</option>
            <option value="Canada">Canada</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Brazil">Brazil</option>
            <option value="Japan">Japan</option>
            <option value="South Korea">South Korea</option>
            <option value="Other">Other</option>
        `;
        // Create custom location input (hidden by default)
        const customLocationInput = document.createElement("input");
        customLocationInput.type = "text";
        customLocationInput.id = "custom-influencer-location";
        customLocationInput.placeholder = "Enter custom location";
        customLocationInput.style.display = "none";
        customLocationInput.style.margin = "8px 0";
        customLocationInput.style.padding = "6px 12px";
        customLocationInput.style.borderRadius = "6px";
        customLocationInput.style.fontSize = "1rem";
        customLocationInput.style.border = "1px solid #d1d5db";
        customLocationInput.style.background = "#fff";
        customLocationInput.style.width = "100%";

        influencerLocationInput.addEventListener("change", (e) => {
            if (e.target.value === "Other") {
                customLocationInput.style.display = "block";
            } else {
                customLocationInput.style.display = "none";
            }
        });

        campaignGeneratorSection.insertBefore(influencerLabel, campaignGeneratorSection.firstChild);
        campaignGeneratorSection.insertBefore(influencerLocationInput, influencerLabel.nextSibling);
        campaignGeneratorSection.insertBefore(customLocationInput, influencerLocationInput.nextSibling);
    }

    // Utility: Converts a Blob object to a Base64 string.
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async function callGroqApi(imageBase64) {
        const API_URL = "https://api.groq.com/openai/v1/chat/completions";

        const systemPrompt = `You are a market analyst assistant. Your task is to analyze the provided image from a marketing perspective. Identify the product/service, industry, and target demographic. You must return the answer ONLY as a valid JSON object with the keys "productService", "industry", and "targetDemographic".`;

        const payload = {
            model: "meta-llama/llama-4-scout-17b-16e-instruct", // Using the model you specified
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this image and provide the marketing context as a JSON object." },
                        {
                            type: "image_url",
                            image_url: { url: imageBase64 },
                        },
                    ],
                },
            ],
            max_tokens: 512,
            temperature: 0.2,
            top_p: 1,
            stream: false,
            response_format: { type: "json_object" },
        };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
            }

            const result = await response.json();
            const content = result.choices[0]?.message?.content;
            if (content) {
                console.log("Groq API Analysis:", content);
                return JSON.parse(content);
            }
            return null;
        } catch (error) {
            console.error("Error calling Groq API:", error);
            return null;
        }
    }

    async function getCaptions(imageBase64, formData) {
        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
        // Compose context
        const contextPrompt = formData.productService && formData.industry && formData.targetDemographic
            ? `\n\nMarketing Context:\n- Product/Service: ${formData.productService}\n- Industry: ${formData.industry}\n- Target Demographic: ${formData.targetDemographic}`
            : "";
        const tonePrompt = formData.tone ? `\n- Tone: ${formData.tone}` : "";
        const audiencePrompt = formData.targetAudience ? `\n- Target Audience: ${formData.targetAudience}` : "";
        let emojiPrompt = "";
        if (formData.emoji && formData.hashtags) {
            emojiPrompt = "\n- Include emojis and relevant hashtags in the captions.";
        } else if (formData.emoji && !formData.hashtags) {
            emojiPrompt = "\n- Include emojis in the captions but DO NOT include any hashtags.";
        } else if (!formData.emoji && formData.hashtags) {
            emojiPrompt = "\n- Include relevant hashtags in the captions but DO NOT include any emojis.";
        } else {
            emojiPrompt = "\n- DO NOT include emojis or hashtags in the captions. Keep the text clean without any # symbols or emoji characters.";
        }
        const platforms = (formData.selectedPlatforms && formData.selectedPlatforms.length > 0)
            ? formData.selectedPlatforms
            : ["Instagram", "Facebook", "Twitter", "LinkedIn"];

        const combinedPrompt = `You are an expert content writer. Your task is to analyze the image provided and generate engaging social media captions for the following platforms: ${platforms.join(", ")}.\nTailor the tone and content for each platform.\n${emojiPrompt}${contextPrompt}${tonePrompt}${audiencePrompt}\n\nReturn your answer as a valid JSON object with keys for each platform (e.g., Instagram, Facebook, Twitter, LinkedIn), and the value as the caption string for that platform. Do not include any explanation or extra text.`;

        const payload = {
            contents: [{
                parts: [
                    { text: combinedPrompt },
                    { inlineData: { mimeType: "image/png", data: imageBase64.split(',')[1] } }
                ]
            }],
            generation_config: {
                responseModalities: ["Text"]
            }
        };
        try {
            const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini API request failed: ${errorBody}`);
            }
            const result = await response.json();
            const textPart = result.candidates[0].content.parts.find(part => part.text);
            if (textPart && textPart.text) {
                // Try to parse JSON
                try {
                    const captions = JSON.parse(textPart.text);
                    return { captions };
                } catch (e) {
                    // Fallback: return as plain text
                    return textPart.text;
                }
            }
            return null;
        } catch (error) {
            console.error("Error calling Gemini API for analysis:", error);
            return null;
        }
    }

    // Render captions without copy and PDF buttons
    function renderCaptionsWithIcons(captionsObj) {
        let combinedCaptions = "";
        for (const [platform, caption] of Object.entries(captionsObj)) {
            const cleanCaption = caption.trim().replace(/(\r\n|\n|\r){2,}/g, '\n\n');
            combinedCaptions += `<strong>${platform}:</strong>\n${cleanCaption}\n\n`;
        }
        // Trim the final double newline
        combinedCaptions = combinedCaptions.trim();
        
        // Use a single <pre> tag to display the combined text, which respects newlines
        return `<pre style="white-space: pre-wrap; font-family: inherit; margin: 0; padding: 0; line-height: 1.5;">${combinedCaptions}</pre>`;
    }

    function renderCampaignResults(data) {
        const { campaignName, bigIdea, prAngles, keyMessages, targetMediaOutlets, creativeHooks, influencerLocation, topInfluencers } = data;
        let html = `<div class="campaign-results">`;
        if (campaignName) {
            html += `<h2>${campaignName}</h2>`;
        }
        if (bigIdea) {
            html += `<h3>The Big Idea</h3><p>${bigIdea}</p>`;
        }
        if (prAngles && prAngles.length > 0) {
            html += `<h3>PR Angles</h3>`;
            prAngles.forEach(item => {
                html += `<div class="pr-angle"><strong>${item.angle}</strong><p>${item.pitch}</p></div>`;
            });
        }
        if (keyMessages && keyMessages.length > 0) {
            html += `<h3>Key Messages</h3><ul>${keyMessages.map(msg => `<li>${msg}</li>`).join('')}</ul>`;
        }
        if (targetMediaOutlets && targetMediaOutlets.length > 0) {
            html += `<h3>Target Media Outlets</h3><ul>${targetMediaOutlets.map(outlet => `<li>${outlet}</li>`).join('')}</ul>`;
        }
        if (creativeHooks && creativeHooks.length > 0) {
            html += `<h3>Creative Hooks</h3>`;
            creativeHooks.forEach(item => {
                html += `<div class="creative-hook"><strong>${item.hook}</strong><p>${item.description}</p></div>`;
            });
        }
        // Show influencerRecommendations if present, else fallback to topInfluencers
        if (data.influencerRecommendations && data.influencerRecommendations.length > 0) {
            html += `<div style="display:flex; align-items:center; gap:8px; margin-top:36px; margin-bottom:24px;">
                <span style="font-size:1.3em;">📊</span>
                <span style="font-size:1.18em; color:#7c3aed; font-weight:700; letter-spacing:0.5px;">Top 5 Influencers for ${influencerLocation || "Selected Location"}</span>
            </div>`;
            data.influencerRecommendations.forEach(inf => {
                html += `
                <div class="influencer-card creative-hook" style=" margin: 16px 0; border-radius: 0 4px 4px 0; font-size: 14px; color: #7c3aed; font-weight: 500; background: rgba(124, 58, 237, 0.04); border: 1px solid rgba(124, 58, 237, 0.1);">
                    
                        
                        <div style="font-size: 1.08em; font-weight: 700; color: #1f2937;">${inf.name}</div>
                        <div style="font-size: 0.98em; color: #6b7280; font-weight: 500;">${inf.platform}</div>
                        <div style="margin-bottom: 8px; line-height: 1.6;"><span style="font-style: italic; color: #7c3aed;">Audience:</span> <span style="color: #374151;">${inf.audience}</span></div>
                        <div style="margin-bottom: 8px; line-height: 1.6;"><span style="font-style: italic; color: #7c3aed;">Relevance:</span> <span style="color: #374151;">${inf.relevance}</span></div>
                        <div style="margin-bottom: 8px; line-height: 1.6;"><span style="font-style: italic; color: #7c3aed;">Collaboration Approach:</span> <span style="color: #374151;">${inf.collaborationApproach}</span></div>
                        <div style="line-height: 1.6;"><span style="font-style: italic; color: #7c3aed;">Contact Strategy:</span> <span style="color: #374151;">${inf.contactStrategy}</span></div>
                </div>
                `;
            });
        } else if (topInfluencers && topInfluencers.length > 0) {
            html += `<h3>Top 5 Influencers for ${influencerLocation || "Selected Location"}</h3><ul>${topInfluencers.map(inf => `<li>${inf}</li>`).join('')}</ul>`;
        }
        html += `</div>`;
        return html;
    }


    // New campaign API function to request influencers
    async function getCampaignWithInfluencers(imageBase64, formData) {
        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
        const contextPrompt = formData.productService && formData.industry && formData.targetDemographic
            ? `\n\nMarketing Context:\n- Product/Service: ${formData.productService}\n- Industry: ${formData.industry}\n- Target Demographic: ${formData.targetDemographic}`
            : "";
        const influencerPrompt = formData.influencerLocation ? `\n- Influencer Marketing Location: ${formData.influencerLocation}` : "";
        const combinedPrompt = `You are an expert PR and influencer marketing strategist. Your task is to analyze the image provided and generate a creative, strategic PR campaign based on the provided context.
                                \n\nYou must also provide a strategic influencer marketing plan for the selected location (${formData.influencerLocation || "Worldwide"}). Focus on finding truly relevant influencers who align with the brand's values, audience, and marketing goals - NOT simply the most popular ones.
                                \n\nReturn your answer ONLY as a single, valid JSON object with NO additional text or explanation. The JSON object must have the following keys: "campaignName", "bigIdea", "prAngles", "keyMessages", "targetMediaOutlets", "creativeHooks", "influencerLocation", and "influencerRecommendations".
                                \n\n- **"campaignName"**: (String) A catchy, memorable name for the campaign.
                                \n- **"bigIdea"**: (String) The single, compelling core concept of the campaign.
                                \n- **"prAngles"**: (Array of Objects) At least two distinct story angles to pitch to the media. Each object should have "angle" (String) and "pitch" (String) keys.
                                \n- **"keyMessages"**: (Array of Strings) The top 3-4 core messages the campaign should communicate.
                                \n- **"targetMediaOutlets"**: (Array of Strings) A list of 3-5 types of media outlets to target (e.g., "Tech blogs," "Lifestyle magazines," "Local news").
                                \n- **"creativeHooks"**: (Array of Objects) At least two creative, attention-grabbing tactics to generate buzz. Each object should have "hook" (String) and "description" (String) keys.
                                \n- **"influencerLocation"**: (String) The selected location for influencer marketing.
                                \n- **"influencerRecommendations"**: (Array of Objects) The top 5 most RELEVANT (not just popular) influencers for this specific campaign. Each object must include:
                                    - **"name"**: (String) Influencer name or handle
                                    - **"platform"**: (String) Their primary social media platform
                                    - **"audience"**: (String) Brief description of their audience demographics
                                    - **"relevance"**: (String) Detailed explanation of why they specifically align with this product/brand (min 50 words)
                                    - **"collaborationApproach"**: (String) Strategic recommendation for how to approach and work with this influencer
                                    - **"contactStrategy"**: (String) Practical guidance on the best way to reach out to them\n${contextPrompt}${influencerPrompt}`;
        const payload = {
            contents: [{
                parts: [
                    { text: combinedPrompt },
                    { inlineData: { mimeType: "image/png", data: imageBase64.split(',')[1] } }
                ]
            }],
            generation_config: {
                response_mime_type: "application/json",
                responseModalities: ["Text"]
            }
        };
        try {
            const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini API request failed: ${errorBody}`);
            }
            const result = await response.json();
            console.log(result);
            const textPart = result.candidates[0].content.parts.find(part => part.text);
            if (textPart && textPart.text) {
                try {
                    return JSON.parse(textPart.text);
                } catch (e) {
                    console.error("Failed to parse JSON from Gemini response for campaign:", textPart.text, e);
                    return textPart.text;
                }
            }
            return null;
        } catch (error) {
            console.error("Error calling Gemini API for campaign generation:", error);
            return null;
        }
    }
    
    async function applyModifications(imageBase64, modificationSteps) {
        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent";
        // Use the previous working approach for image generation (no system_instruction, no safety_settings)
        const prompt = `Apply the following visual improvements to the provided design image **without altering or interfering with any text, brand name, or logo in any way**.

                        Strict guidelines:
                        - **Do NOT** add, change, remove, obscure, or distort any text, brand name, or logo.
                        - **Do NOT** generate or overlay any new text or graphical elements containing text.
                        - Focus **only** on modifying non-text, non-logo design elements such as background, color palette, lighting, layout spacing, imagery, and visual effects.
                        - All changes must align precisely with the provided instructions.

                        Instructions: ${modificationSteps}`;
        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: "image/png", data: imageBase64.split(',')[1] } }
                ]
            }],
            generation_config: {
                responseModalities: ["Image", "Text"]
            }
        };
        try {
            const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini API request failed: ${errorBody}`);
            }
            const result = await response.json();
            console.log("Gemini API Response:", result);
            
            // Check if response has expected structure
            if (!result.candidates || result.candidates.length === 0) {
                console.error("No candidates in Gemini response:", result);
                return null;
            }
            
            const candidate = result.candidates[0];
            if (!candidate.content || !candidate.content.parts) {
                console.error("Invalid candidate structure:", candidate);
                return null;
            }
            
            const imagePart = candidate.content.parts.find(part => part.inlineData);
            return {
                modifiedImage: imagePart ? "data:image/png;base64," + imagePart.inlineData.data : null
            };
        } catch (error) {
            console.error("Error calling Gemini API for modification:", error);
            return null;
        }
    }

    // Add download options for the improved image
function showDownloadOptions(imageDataUrl, container) {
    // Remove any existing download container (only if not using a custom container)
    if (!container) {
        let oldDownload = document.getElementById("download-container");
        if (oldDownload) oldDownload.remove();
    }
    // Create container
    const downloadContainer = document.createElement("div");
    downloadContainer.id = "download-container";
    downloadContainer.style.display = "flex";
    downloadContainer.style.gap = "12px";
    downloadContainer.style.margin = "16px 0 0 0";
    downloadContainer.style.justifyContent = "center";
    // Supported formats
    const formats = [
        { ext: "png", label: "PNG" },
        { ext: "jpeg", label: "JPEG" },
        { ext: "webp", label: "WEBP" }
    ];
    formats.forEach(fmt => {
        const btn = document.createElement("button");
        btn.textContent = fmt.label;
        btn.className = "analyze-button";
        btn.style.width = "auto";
        btn.style.padding = "6px 12px";
        btn.style.fontSize = "0.8rem";
        btn.style.borderRadius = "6px";
        btn.style.boxShadow = "none";
        btn.style.textTransform = "none";
        btn.style.letterSpacing = "0";
        btn.style.margin = "0";
        btn.style.minWidth = "50px";
        btn.onclick = () => downloadImage(imageDataUrl, fmt.ext);
        downloadContainer.appendChild(btn);
    });
    if (container) {
        container.appendChild(downloadContainer);
    } else {
        imageContainer.appendChild(downloadContainer);
    }
}

    // Download the improved image in the selected format
    function downloadImage(dataUrl, format) {
        const img = new window.Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            let mime = 'image/png';
            if (format === 'jpeg') mime = 'image/jpeg';
            if (format === 'webp') mime = 'image/webp';
            canvas.toBlob(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `improved-design.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, mime);
        };
        img.src = dataUrl;
    }

    // Enable the button only when addOnUISdk is ready
    analyzeButton.disabled = false;

    // Restore getModificationSteps function
    async function getModificationSteps(imageBase64, formData) {
        const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
        const formalityDescriptions = {
            1: "very informal and casual",
            2: "informal and friendly",
            3: "balanced between informal and formal",
            4: "formal and professional",
            5: "very formal and corporate"
        };
        const combinedPrompt = `You are a marketing and design impact expert. Analyze the provided design image based on the context below.

        Context:
        - Product/Service: ${formData.productService}
        - Industry: ${formData.industry}
        - Target Demographic: ${formData.targetDemographic}
        - Desired Formality Level: ${formData.formalityLevel}/5 (${formalityDescriptions[formData.formalityLevel]})${formData.customPrompt ? `\n- Additional Notes: ${formData.customPrompt}` : ''}

        Your task is to return a single, valid JSON object with NO additional text or explanation. The JSON object must have the following three keys: "designScore", "displaySuggestions", and "designerInstructions".

        1.  **"designScore"**: (Number) Provide a score from 1 to 10 evaluating the design's overall marketing effectiveness based on the context.
        2.  **"displaySuggestions"**: (String) Write a concise, user-friendly summary of actionable design suggestions in Markdown format (≤50 words). This will be shown to the user.
        3.  **"designerInstructions"**: (String) Provide a detailed, comprehensive analysis and a clear list of visual adjustments for a graphic designer LLM. This should include an evaluation of audience resonance, sales potential, and precise, practical directives for enhancement (e.g., "Brighten background," "Increase headline font size by 15%"). This text will be passed to the image generation model.

        Constraints for "designerInstructions":
        - Do *not* suggest removing or obscuring the brand name, logo, or core product elements.
        - Avoid suggestions that would add distorted, unclear, or artificial text or visuals.
        - All suggestions should enhance — not reinvent — the existing design.
        `;
        const payload = {
            contents: [{
                parts: [
                    { text: combinedPrompt },
                    { inlineData: { mimeType: "image/png", data: imageBase64.split(',')[1] } }
                ]
            }],
            generation_config: {
                response_mime_type: "application/json",
                responseModalities: ["Text"]
            }
        };
        try {
            const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Gemini API request failed: ${errorBody}`);
            }
            const result = await response.json();
            const textPart = result.candidates[0].content.parts.find(part => part.text);
            if (textPart && textPart.text) {
                try {
                    // The response should be a JSON string, so parse it directly.
                    return JSON.parse(textPart.text);
                } catch (e) {
                    console.error("Failed to parse JSON from Gemini response:", textPart.text, e);
                    return null; // Return null if parsing fails
                }
            }
            return null;
        } catch (error) {
            console.error("Error initializing addOnUISdk:", error);
        }
    }
});