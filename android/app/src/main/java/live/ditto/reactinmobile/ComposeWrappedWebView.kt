package live.ditto.reactinmobile

// The built in Android WebView
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient

// Import the WebViewAssetLoader
// This is part of the AndroidX Webkit library
// The gradle dependency is `androidx.webkit:webkit:1.9.0`
// See the gradle file for more details
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler

import android.view.ViewGroup
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalInspectionMode
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.viewinterop.AndroidView
import live.ditto.reactinmobile.ui.theme.ReactInMobileTheme

@Composable
fun ComposeWrappedWebView() {
    val inPreview = LocalInspectionMode.current
    AndroidView(
        factory = { context ->

            val assetLoader = WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", AssetsPathHandler(context))
                .build()

            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )

                if (!inPreview) {
                    // 1. ACTIVER LE JAVASCRIPT (Obligatoire pour React)
                    @Suppress("SetJavaScriptEnabled")
                    settings.javaScriptEnabled = true  // <--- CHANGEZ 'false' EN 'true'

                    // 2. ACTIVER LE DOM STORAGE (Obligatoire pour votre AuthContext et localStorage)
                    settings.domStorageEnabled = true

                    // 3. (Optionnel mais recommandé) Permettre le zoom si besoin
                    settings.setSupportZoom(false)
                }

                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView,
                        request: WebResourceRequest
                    ): WebResourceResponse? {
                        return assetLoader.shouldInterceptRequest(request.url)
                    }
                }

                // 4. VERIFICATION DU CHEMIN
                // Assurez-vous que vos fichiers React (index.html, assets, etc.) sont bien
                // dans le dossier android/app/src/main/assets/dist/
                loadUrl("https://appassets.androidplatform.net/assets/dist/index.html")
            }
        },
        update = {}
    )
}

@Preview(showBackground = true, apiLevel = 33)
@Composable
fun ComposeWrappedWebViewPreview() {
    ReactInMobileTheme {
        ComposeWrappedWebView()
    }
}
