$(document).ready(function() {
    const savedApiKey = localStorage.getItem('openaiApiKey');
    if (savedApiKey) {
        $('#apiKey').val(savedApiKey);
    }

    $('#settingsBtn').click(function() {
        $('#settingsModal').toggle();
    });

    $('#apiKey').change(function() {
        localStorage.setItem('openaiApiKey', $(this).val());
    });

    $(document).click(function(event) {
        if (!$(event.target).closest('#settingsModal').length && 
            !$(event.target).closest('#settingsBtn').length) {
            $('#settingsModal').hide();
        }
    });

    $('#btn').click(function() {
        let imageSize = $('#sizeSelect').val();
        let imageStyle = $('#styleSelect').val();
        let imageQuality = $('#qualitySelect').val();

        if ($('#apiKey').val().trim() === '') {
            $('#errorText').text('Please enter your OpenAI API key in settings.');
            $("#errorToast").toast("show");
            return;
        }

        if ($('#prompt').val().trim() === '') {
            $('#errorText').text('Please enter a prompt.');
            $("#errorToast").toast("show");
            return;
        }

        $('#btn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Generating...');

        $.ajax({
            url: "https://api.openai.com/v1/images/generations",
            type: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + $('#apiKey').val().trim()
            },
            data: JSON.stringify({
                model: "dall-e-3",
                prompt: $('#prompt').val(),
                n: 1,
                size: imageSize,
                style: imageStyle,
                quality: imageQuality,
                response_format: "url"
            }),
            success: function(data) {
                $('#btn').prop('disabled', false).text('Generate');

                data.data.forEach(item => {
                    $('#imageList').prepend(`
                        <div class="image-card">
                            <img src="${item.url}" alt="${item.revised_prompt}" class="img-fluid">
                            <div class="p-3">
                                <h6>Revised Prompt</h6>
                                <p class="text-light">${item.revised_prompt}</p>
                                <a href="${item.url}" target="_blank" class="btn btn-sm btn-outline-light">
                                    Open Image
                                </a>
                            </div>
                        </div>
                    `);
                });
            },
            error: function(xhr, status, error) {
                const err = JSON.parse(xhr.responseText);
                $('#btn').prop('disabled', false).text('Generate');
                $('#errorText').text(err.error.message);
                $("#errorToast").toast("show");
            }
        });
    });
});
