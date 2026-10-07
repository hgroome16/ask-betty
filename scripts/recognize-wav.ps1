$AudioPath=$env:BETTY_AUDIO_PATH
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$engine=New-Object System.Speech.Recognition.SpeechRecognitionEngine([System.Globalization.CultureInfo]::GetCultureInfo('en-US'))
try {
 $dictation=New-Object System.Speech.Recognition.DictationGrammar
 $engine.LoadGrammar($dictation)
 $commands=New-Object System.Speech.Recognition.Choices
 @('What is new with Bettys Eddies','Tell me about Bettys Eddies','What is new with my accounts','What meetings do I have today','What do I owe','Tell me about Perk Up Pumpkin','Tell me about Bedtime Bettys','Tell me about Bite a Mins','Catch me up on Prairie Cannabis','Read my daily brief','What products are available in Massachusetts') | ForEach-Object {$commands.Add($_)}
 $builder=New-Object System.Speech.Recognition.GrammarBuilder
 @('What is my day like today','Who are my appointments','What are my meetings','Give me account updates','Who do I now owe','What are the news items','What are my accounts that need attention','Who should I follow up soon with','Give me todays trends','What is moving','What are the top ten products that are selling','Do I have any meeting notes','Read my meeting notes','Who are my prospects','What products do we have','What merch is available','What are my field reports') | ForEach-Object {$commands.Add($_)}
 @('Harbor Wellness','Harbor','Bayview Dispensary','Prairie Cannabis','Coastal Collective','Commonwealth Collective','Valley Green','Berkshire Bloom','Canal Street Cannabis','Seaport Leaf','Riverbend Wellness') | ForEach-Object { $commands.Add('What do I owe '+$_); $commands.Add('Catch me up on '+$_); $commands.Add('Take me to '+$_) }
 @('News That Matters','Daily Brief','My Accounts','Prospects','Market Snaps','Products','Brand','What Do I Owe','Field Reports','Meeting Notes','More tools','QuickHits','home') | ForEach-Object { $commands.Add('Take me to '+$_); $commands.Add('Open '+$_); $commands.Add('Show me '+$_) }
 $builder.Append($commands)
 $engine.LoadGrammar((New-Object System.Speech.Recognition.Grammar($builder)))
 $engine.SetInputToWaveFile($AudioPath)
 $parts=New-Object System.Collections.Generic.List[string]
 while($null -ne ($result=$engine.Recognize())) {if($result.Text){$parts.Add($result.Text)}}
 @{text=($parts -join ' ')} | ConvertTo-Json -Compress
} finally {$engine.Dispose()}
