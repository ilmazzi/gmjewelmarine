<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        if ($request->has('image_data')) {
            $data = $request->validate([
                'filename' => ['nullable', 'string', 'max:255'],
                'mime_type' => ['required', 'string', 'max:100'],
                'image_data' => ['required', 'string'],
            ]);

            abort_unless(str_starts_with($data['mime_type'], 'image/'), 422, 'Il file deve essere un\'immagine.');

            $base64 = preg_replace('/^data:image\/[a-zA-Z0-9.+-]+;base64,/', '', $data['image_data']);
            $contents = base64_decode($base64, true);

            abort_unless($contents !== false, 422, 'Immagine non valida.');
            abort_if(strlen($contents) > 2 * 1024 * 1024, 422, 'Immagine troppo grande. Riprova con un file più leggero.');

            $extension = pathinfo($data['filename'] ?? '', PATHINFO_EXTENSION) ?: $this->extensionFromMime($data['mime_type']);
            $path = $this->storeUpload($contents, $extension);

            return response()->json([
                'file_url' => '/storage/'.$path,
            ], 201);
        }

        $request->validate([
            'file' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $path = $this->storeUpload(
            file_get_contents($request->file('file')->getRealPath()),
            $request->file('file')->extension(),
        );

        return response()->json([
            'file_url' => '/storage/'.$path,
        ], 201);
    }

    private function storeUpload(string $contents, string $extension): string
    {
        $path = 'uploads/'.Str::uuid().'.'.$extension;
        $publicRoot = env('PUBLIC_UPLOAD_ROOT');

        if ($publicRoot) {
            $targetDirectory = rtrim($publicRoot, '/\\').DIRECTORY_SEPARATOR.'uploads';

            if (! is_dir($targetDirectory)) {
                mkdir($targetDirectory, 0755, true);
            }

            file_put_contents($targetDirectory.DIRECTORY_SEPARATOR.basename($path), $contents);

            return $path;
        }

        Storage::disk('public')->put($path, $contents);

        return $path;
    }

    private function extensionFromMime(string $mime): string
    {
        return match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            default => 'bin',
        };
    }
}
