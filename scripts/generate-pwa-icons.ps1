Add-Type -AssemblyName System.Drawing

$publicDir = "c:\Users\Raghavi\Pictures\Screenshots\HapDaily\hapdaily\public"
$iconsDir = Join-Path $publicDir "icons"
if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null }

function Generate-HapIcon {
    param(
        [int]$size,
        [string]$outputPath,
        [bool]$isMaskable = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Gradient background: Vibrant Emerald (#059669) to Deep Royal Blue (#1e40af)
    $cTop = [System.Drawing.Color]::FromArgb(255, 5, 150, 105)
    $cBottom = [System.Drawing.Color]::FromArgb(255, 30, 64, 175)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $cTop, $cBottom, 45.0)
    
    if ($isMaskable) {
        $g.FillRectangle($brush, $rect)
    } else {
        $radius = [int]($size * 0.22)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $radius * 2
        $path.AddArc(0, 0, $d, $d, 180, 90)
        $path.AddArc($size - $d, 0, $d, $d, 270, 90)
        $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
        $path.AddArc(0, $size - $d, $d, $d, 90, 90)
        $path.CloseFigure()
        $g.FillPath($brush, $path)
        $path.Dispose()
    }
    $brush.Dispose()

    # Draw circular milk splash motif behind text
    $dropBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 255, 255, 255))
    $dropSize = [int]($size * 0.36)
    $dropX = [int](($size - $dropSize) / 2)
    $dropY = [int]($size * 0.15)
    $g.FillEllipse($dropBrush, $dropX, $dropY, $dropSize, $dropSize)
    $dropBrush.Dispose()

    # Draw main text: 'HAP'
    $scaleFactor = if ($isMaskable) { 0.25 } else { 0.29 }
    $fontSize = [int]($size * $scaleFactor)
    $fontFamily = New-Object System.Drawing.FontFamily("Arial")
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    $textRect = New-Object System.Drawing.RectangleF(0, [float]($size * 0.28), [float]$size, [float]($size * 0.40))
    $g.DrawString("HAP", $font, $textBrush, $textRect, $sf)
    $font.Dispose()
    $textBrush.Dispose()

    # Draw Subtitle: 'DAILY'
    $subFontSize = [int]($fontSize * 0.38)
    $subFont = New-Object System.Drawing.Font($fontFamily, $subFontSize, [System.Drawing.FontStyle]::Bold)
    $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 209, 250, 229)) # #d1fae5
    $subRect = New-Object System.Drawing.RectangleF(0, [float]($size * 0.65), [float]$size, [float]($size * 0.18))
    $g.DrawString("DAILY", $subFont, $subBrush, $subRect, $sf)
    $subFont.Dispose()
    $subBrush.Dispose()
    $fontFamily.Dispose()
    $sf.Dispose()

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Generated: $outputPath"
}

Generate-HapIcon -size 192 -outputPath (Join-Path $iconsDir "icon-192x192.png")
Generate-HapIcon -size 512 -outputPath (Join-Path $iconsDir "icon-512x512.png")
Generate-HapIcon -size 512 -outputPath (Join-Path $iconsDir "maskable-icon-512x512.png") -isMaskable $true
Generate-HapIcon -size 180 -outputPath (Join-Path $iconsDir "apple-touch-icon.png")

# Also place root icons for direct browser fallback
Copy-Item (Join-Path $iconsDir "icon-192x192.png") (Join-Path $publicDir "icon-192x192.png") -Force
Copy-Item (Join-Path $iconsDir "icon-512x512.png") (Join-Path $publicDir "icon-512x512.png") -Force
Copy-Item (Join-Path $iconsDir "maskable-icon-512x512.png") (Join-Path $publicDir "maskable-icon-512x512.png") -Force
Copy-Item (Join-Path $iconsDir "apple-touch-icon.png") (Join-Path $publicDir "apple-touch-icon.png") -Force
Write-Output "All PWA icons generated successfully."
