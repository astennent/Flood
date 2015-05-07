﻿#pragma strict

private var m_displaying : boolean;
private var displayTime : float;

private var largeSize = 0.1;
private var smallSize = 0.05;

var isClickAnywhere = false;

function Start() {
   m_displaying = false;
   GetComponent.<Renderer>().enabled = false;
}

function Display() {
   m_displaying = true;
   GetComponent.<Renderer>().enabled = true;
   displayTime = Time.time;
   if (isClickAnywhere) {
      transform.position.y = 0;
      GetComponent.<Renderer>().material.color.a = 0;
   } else {
      transform.position.y = -3;
      GetComponent.<Renderer>().material.color.a = 1;
   }
}

function Hide() {
   m_displaying = false;
   GetComponent.<Renderer>().enabled = false;
}

function Update () {
   if (!m_displaying) {
      return;
   }

   var elapsedTime = Time.time - displayTime;

   if (isClickAnywhere) {
      if (elapsedTime > 2.4) {
         GetComponent.<Renderer>().material.color.a = Mathf.Lerp(GetComponent.<Renderer>().material.color.a, 1, .1);
      }
   } 
   else {
      if (elapsedTime > 2.4) {
         m_displaying = true;
         GetComponent.<Renderer>().enabled = false;
      }

      if (elapsedTime < 1) 
         transform.position.y = Mathf.Lerp(transform.position.y, .5, .1);
      else if (elapsedTime > 1.5) {
         GetComponent.<Renderer>().material.color.a = Mathf.Lerp(GetComponent.<Renderer>().material.color.a, 0, .1);
      }
   }

}

