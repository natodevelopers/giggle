$files = Get-ChildItem -Path "d:\SearchEx" -Filter "*.scss" -Recurse
foreach ($file in $files) {
    if ($file.Name -ne "mixins.scss" -and $file.Name -ne "variables.scss") {
        $content = Get-Content $file.FullName -Raw
        $content = $content -replace '@use "@/app/mixins";', '@use "@/app/mixins" as mixins;'
        $content = $content -replace "@use '@/app/mixins';", '@use "@/app/mixins" as mixins;'
        $content = $content -replace '@include mobile', '@include mixins.mobile'
        $content = $content -replace '@include gradient-text', '@include mixins.gradient-text'
        $content = $content -replace '@include gradient-border', '@include mixins.gradient-border'
        Set-Content $file.FullName $content
    }
}