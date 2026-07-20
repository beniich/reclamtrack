package com.reclamtrack.mobile.ui.webview

import android.webkit.JavascriptInterface
import com.reclamtrack.mobile.security.TokenManager

class WebAppInterface(private val tokenManager: TokenManager) {

    @JavascriptInterface
    fun getToken(): String? {
        return tokenManager.getToken()
    }

    @JavascriptInterface
    fun saveToken(token: String) {
        tokenManager.saveToken(token)
    }

    @JavascriptInterface
    fun logout() {
        tokenManager.clearToken()
    }
}
