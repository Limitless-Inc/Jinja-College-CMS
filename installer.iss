[Setup]
AppName=Jinja College CMS
AppVersion=1.0.0
DefaultDirName={autopf}\Jinja College CMS
DefaultGroupName=Jinja College CMS
OutputDir=installer_output
OutputBaseFilename=JinjaCollegeCMS-Setup
Compression=lzma2
SolidCompression=yes
SetupIconFile=public\icon.png
UninstallDisplayIcon={app}\Jinja College CMS.exe
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional icons:"

[Files]
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Jinja College CMS"; Filename: "{app}\Jinja College CMS.exe"
Name: "{autodesktop}\Jinja College CMS"; Filename: "{app}\Jinja College CMS.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\Jinja College CMS.exe"; Description: "Launch Jinja College CMS"; Flags: nowait postinstall skipifsilent
