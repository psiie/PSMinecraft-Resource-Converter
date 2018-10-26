(function() {
  'use strict';

  function xhrFn() {
    var xmlHttpRequest = new XMLHttpRequest(); // create an XMLHttpRequest
    xmlHttpRequest.upload.addEventListener('progress', function(evt) {
      if (!evt || !evt.lengthComputable) { return; }
      var percentComplete = parseInt(evt.loaded / evt.total * 100); // calculate the percentage of upload completed

      // update the Bootstrap progress bar with the new percentage
      $('.progress-bar').text(percentComplete + '%');
      $('.progress-bar').width(percentComplete + '%');
      if (percentComplete === 100) { $('.progress-bar').html('Done'); } // once the upload reaches 100%, set the progress bar text to done
    }, false);
    return xmlHttpRequest;
  }

  function onUploadBtnClicked() {
    var files = $(this).get(0).files;
      if (files.length > 0){
        /* One or more files selected, process the file upload create a FormData
        object which will be sent as the data payload in the AJAX request */
        var formData = new FormData();
        var options = {
          url: '/upload',
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function(data){
            window.location.href = data;
          },
          xhr: xhrFn
        };

        // loop through all the selected files & add the files to formData object for the data payload
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          formData.append('uploads[]', file, file.name);
        }

        $.ajax(options);
      }
  }

  document.addEventListener('DOMContentLoaded', function() {
    $('.upload-btn').on('click', function() {
      $('#upload-input').click();
      $('.upload-btn').prop("disabled",true);
      $('.progress-bar').text('0%');
      $('.progress-bar').width('0%');
    });
    $('#upload-input').on('change', onUploadBtnClicked);
  });
})();
