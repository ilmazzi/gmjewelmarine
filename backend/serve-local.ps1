$ErrorActionPreference = "Stop"

$tempDir = Join-Path $PSScriptRoot "storage\tmp"

if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
}

$env:TMP = $tempDir
$env:TEMP = $tempDir
$env:TMPDIR = $tempDir

php `
    -d "upload_tmp_dir=$tempDir" `
    -d "sys_temp_dir=$tempDir" `
    -d "post_max_size=32M" `
    -d "upload_max_filesize=32M" `
    -S 127.0.0.1:8000 `
    -t (Join-Path $PSScriptRoot "public") `
    (Join-Path $PSScriptRoot "server-local.php")
