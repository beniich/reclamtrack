package com.reclamtrack.mobile.ui.webview

import android.annotation.SuppressLint
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.content.getSystemService
import androidx.fragment.app.Fragment
import com.reclamtrack.mobile.BuildConfig
import com.reclamtrack.mobile.databinding.FragmentWebviewBinding
import com.reclamtrack.mobile.security.TokenManager

class WebViewFragment : Fragment() {

    private var _binding: FragmentWebviewBinding? = null
    private val binding get() = _binding!!
    private lateinit var tokenManager: TokenManager

    // URL de production ou émulateur selon le build
    private val appUrl: String
        get() = if (BuildConfig.DEBUG) "http://10.0.2.2:3000" else "https://reclamtrack.vercel.app"

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentWebviewBinding.inflate(inflater, container, false)
        return binding.root
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        tokenManager = TokenManager(requireContext())

        if (!isNetworkAvailable()) {
            binding.offlineBanner.visibility = View.VISIBLE
            binding.webView.visibility = View.GONE
            return
        }

        setupWebView()
        setupSwipeRefresh()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        binding.webView.apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.setSupportZoom(false)
            settings.builtInZoomControls = false
            settings.displayZoomControls = false
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true

            addJavascriptInterface(WebAppInterface(tokenManager), "AndroidInterface")

            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                    binding.progressBar.visibility = View.VISIBLE
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefreshLayout.isRefreshing = false

                    // Injecter le token JWT existant dans le localStorage de la WebApp
                    val token = tokenManager.getToken()
                    if (!token.isNullOrEmpty()) {
                        val script = """
                            (function() {
                                try {
                                    localStorage.setItem('reclamtrack_access_token', '$token');
                                    // Dispatcher un event pour que le frontend réagisse
                                    window.dispatchEvent(new CustomEvent('mobile-token-ready', { detail: { token: '$token' } }));
                                } catch(e) { console.warn('Token inject error', e); }
                            })();
                        """.trimIndent()
                        view?.evaluateJavascript(script, null)
                    }
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    // Rester dans la WebView pour toutes les URLs du domaine
                    val url = request?.url?.host ?: return false
                    return !url.contains("reclamtrack") && !url.contains("10.0.2.2") && !url.contains("localhost")
                }
            }

            loadUrl(appUrl)
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setOnRefreshListener {
            binding.webView.reload()
        }
    }

    private fun isNetworkAvailable(): Boolean {
        val cm = requireContext().getSystemService<ConnectivityManager>() ?: return false
        val network = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(network) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
