# 1. Empêcher la suppression et le renommage de la classe d'interface JavaScript
-keepattributes *Annotation*
-keepattributes JavascriptInterface

# Chemin exact de la classe d'interface WebView ReclamTrack
-keep class com.reclamtrack.mobile.ui.webview.WebAppInterface {
    @android.webkit.JavascriptInterface <methods>;
}

# 2. Préserver les modèles de données et de sécurité
-keepclassmembers class com.reclamtrack.mobile.models.** {
    <fields>;
    <methods>;
}

-keepclassmembers class com.reclamtrack.mobile.security.** {
    <fields>;
    <methods>;
}

# 3. Optimisations et suppression des warnings bibliothèques tierces
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn retrofit2.**
