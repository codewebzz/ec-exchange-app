package com.ecexchange

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.TextView
import androidx.core.content.ContextCompat

class SplashActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.splash_screen)
        
        // Set status bar color to black
        window.statusBarColor = ContextCompat.getColor(this, android.R.color.black)
        
        val ecText = findViewById<TextView>(R.id.ec_text)
        val exchangeText = findViewById<TextView>(R.id.exchange_text)
        val loadingView = findViewById<View>(R.id.loading_view)
        
        // Load animations
        val ecAnimation = AnimationUtils.loadAnimation(this, R.anim.slide_from_top)
        val exchangeAnimation = AnimationUtils.loadAnimation(this, R.anim.slide_from_bottom)
        val loadingAnimation = AnimationUtils.loadAnimation(this, R.anim.loading_animation)
        
        // Start animations
        ecText.startAnimation(ecAnimation)
        exchangeText.startAnimation(exchangeAnimation)
        loadingView.startAnimation(loadingAnimation)
        
        // Navigate to main activity after 3 seconds
        Handler(Looper.getMainLooper()).postDelayed({
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
            finish()
        }, 3000)
    }
} 