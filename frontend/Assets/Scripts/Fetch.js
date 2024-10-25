// @input Asset.RemoteServiceModule rsm


function fetch(data, width, height, callback) {
    const request = RemoteServiceHttpRequest.create();
//    request.url = "http://127.0.0.1:8000/";
    request.url = "https://rohil.ayush.digital";
    request.method = RemoteServiceHttpRequest.HttpRequestMethod.Post;
    request.setHeader('Content-Type', 'application/json');
    request.body = `{"data": "${data}", "width": ${width}, "height": ${height}}`
    
    let value = ""
    
    function onResponse(response){
        print("Status code: " + response.statusCode);
        value = response.body
        callback(value)
    }
    
    script.rsm.performHttpRequest(request, onResponse);
    
//    while (value === "") {
//        print("waiting")        
//    }
//    return value
    
}


script.fetch = fetch