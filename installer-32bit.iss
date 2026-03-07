[Setup]
AppName=Jinja College CMS
AppVersion=1.0.0
DefaultDirName={autopf32}\Jinja College CMS
DefaultGroupName=Jinja College CMS
OutputDir=installer_output
OutputBaseFilename=JinjaCollegeCMS-Setup-32bit
Compression=lzma2
SolidCompression=yes
SetupIconFile=public\icon.ico
UninstallDisplayIcon={app}\main.exe
PrivilegesRequired=admin

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional icons:"

[Files]
Source: "build\*"; DestDir: "{app}\build"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "main.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "public\icon.png"; DestDir: "{app}\public"; Flags: ignoreversion

[Icons]
Name: "{group}\Jinja College CMS"; Filename: "{app}\main.exe"; WorkingDir: "{app}"
Name: "{autodesktop}\Jinja College CMS"; Filename: "{app}\main.exe"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\main.exe"; Description: "Launch Jinja College CMS"; Flags: nowait postinstall skipifsilent; WorkingDir: "{app}"

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;
