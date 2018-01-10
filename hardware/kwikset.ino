
int keyPadPin = 7;
unsigned long duration;

int ZERO_PULSE = 200; // microseconds
int ONE_PULSE  = 600;  // 600 on 5V pro mini. 800 on 3.3V?
int MAX_PULSE  = 50000;


String str = String("");


unsigned int dur = 0;
String val = "";
String button = "";

int count = 0;
boolean done = false;

int entry = 0;

int keyPress = LOW;

void setup()
{
  Serial.begin( 115200 );

  pinMode( keyPadPin, INPUT );

  Serial.println( "Hello" );

}


void loop()
{
  duration = pulseIn( keyPadPin, HIGH );

  if( duration > 0 ) {
    //Serial.println( "duration: " + String( duration ) );

    if( !done )
      entry = entry << 1;

    if( duration > ONE_PULSE ) {
      val = "1";
      entry = entry | 1;
    } 
    else {
      val = "0";
      entry = entry | 0; 
    }

    str += val;
    //Serial.println( String( count ) + " Dur: " + String( duration ) + " " + val );

    // Serial.print( val );

    count++;
    done = (count % 10 == 0);


  }



  if( done && entry > 0 ) {
    
    button = computeKey( entry );

    if( button == "-1" ) {
      Serial.println( "RST" );
    }
    else {
      //Serial.println( " " + button );
      Serial.println( button );
    }

    //Serial.println( "Entry: " + str + ": " + entry + ": button: " + button );
    entry = 0;
    str = "";
    //count = 0;
  }
}


/*
short KEY_1 = 514;
 short KEY_2 = 516;
 short KEY_3 = 518;
 short KEY_4 = 520;
 short KEY_5 = 522;
 short KEY_6 = 524;
 short KEY_7 = 526;
 short KEY_8 = 528;
 short KEY_9 = 530;
 short KEY_0 = 532;
 short KEY_K = 540;
 
 short KEY_END = 936;
 */
String computeKey( short input ) {

  short key = (input - 512)/2;
  if( key < 0 )
    return "-1";

  // E for end
  if( key == 212 )
    return "E";

  // K for kwikset
  if( key == 14 )
    return "K";

  if( key == 10 )
    return "0";

  return String( key );

}
