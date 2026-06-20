$urls = @{
  "stadium-crowd"    = "https://images.pexels.com/photos/13069970/pexels-photo-13069970.jpeg?cs=srgb&dl=pexels-carlos-jamaica-173742194-13069970.jpg&fm=jpg"
  "stadium-sunset"   = "https://images.pexels.com/photos/1657324/pexels-photo-1657324.jpeg?cs=srgb&dl=pexels-unknown6user-1657324.jpg&fm=jpg"
  "stadium-night"    = "https://images.pexels.com/photos/30651230/pexels-photo-30651230.jpeg?cs=srgb&dl=pexels-george-zografidis-1705219-30651230.jpg&fm=jpg"
  "stadium-flags"    = "https://images.pexels.com/photos/12537018/pexels-photo-12537018.jpeg?cs=srgb&dl=pexels-srijonism-12537018.jpg&fm=jpg"
  "fans-flares"      = "https://images.pexels.com/photos/7151514/pexels-photo-7151514.jpeg?cs=srgb&dl=pexels-onbab-7151514.jpg&fm=jpg"
  "player-action"    = "https://images.pexels.com/photos/32285244/pexels-photo-32285244.jpeg?cs=srgb&dl=pexels-franco-monsalvo-252430633-32285244.jpg&fm=jpg"
  "player-red"       = "https://images.pexels.com/photos/12239376/pexels-photo-12239376.jpeg?cs=srgb&dl=pexels-omar-ramadan-1739260-12239376.jpg&fm=jpg"
  "player-kick"      = "https://images.pexels.com/photos/32179310/pexels-photo-32179310.jpeg?cs=srgb&dl=pexels-franco-monsalvo-252430633-32179310.jpg&fm=jpg"
  "player-ball"      = "https://images.pexels.com/photos/18798601/pexels-photo-18798601.jpeg?cs=srgb&dl=pexels-ravi-roshan-2875998-18798601.jpg&fm=jpg"
  "goalkeeper"       = "https://images.pexels.com/photos/32157745/pexels-photo-32157745.jpeg?cs=srgb&dl=pexels-franco-monsalvo-252430633-32157745.jpg&fm=jpg"
  "training"         = "https://images.pexels.com/photos/30726603/pexels-photo-30726603.jpeg?cs=rgb&dl=pexels-omar-ramadan-1739260-30726603.jpg&fm=jpg"
  "stadium-aerial"   = "https://images.pexels.com/photos/35898730/pexels-photo-35898730.jpeg?cs=srgb&dl=pexels-shotsby-csongii-2159258857-35898730.jpg&fm=jpg"
  "night-game"       = "https://images.pexels.com/photos/14460275/pexels-photo-14460275.jpeg?cs=srgb&dl=pexels-george-zografidis-1705219-14460275.jpg&fm=jpg"
  "morocco-crowd"    = "https://images.pexels.com/photos/34201726/pexels-photo-34201726.jpeg?cs=srgb&dl=pexels-earth-photart-2149767641-34201726.jpg&fm=jpg"
}

$dir = "C:\Users\lukas\Desktop\proyecto-visual-nuevo\public\images"
$ok = 0; $fail = 0

foreach ($kv in $urls.GetEnumerator()) {
  $name = $kv.Key
  $url = $kv.Value
  $out = "$dir\$name.jpg"
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -TimeoutSec 30
    $size = (Get-Item $out).Length
    Write-Host "OK  $name ($($size/1KB -as [int]) KB)"
    $ok++
  } catch {
    Write-Host "FAIL $name"
    $fail++
  }
}
Write-Host "`nDone. OK=$ok FAIL=$fail"