
module.exports = {

  display_error(context, error) 
  {
    console.error('error ' + context + "\n" + error.status + " " + error.response.text);
  },

  //text": "{\"status\":\"CONTENT\",\"content\":{\"id\":12,\"value\":true}}"
  resource_get_result(result)
  {
    var text = result.text;
    var resource_obj = JSON.parse(text);
    return resource_obj;
  }
};