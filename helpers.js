
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
  },

  is_valid_period(period_int, context)
  {
    var valid_periods = [];
    valid_periods.push(1);
    valid_periods.push(5);
    valid_periods.push(15);
    valid_periods.push(30);
    valid_periods.push(60);
    valid_periods.push((60 * 5));
    valid_periods.push((60 * 15));
    valid_periods.push((60 * 30));
    valid_periods.push((60 * 60));
    valid_periods.push((60 * 60 * 3));
    valid_periods.push((60 * 60 * 12));
    valid_periods.push((60 * 60 * 24));
    valid_periods.push((60 * 60 * 24 * 7));
    valid_periods.push((60 * 60 * 24 * 7 * 4));

    if (isNaN(period_int)) console.error("period must be a number");
    else if (!valid_periods.includes(period_int))
    {
      console.error(context + " must be one of " + JSON.stringify(valid_periods));
    }
    else
    {
      return true;
    }
    return false;
  }


};