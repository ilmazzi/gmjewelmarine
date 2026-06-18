<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::query()->orderBy('name')->get()->map(fn (User $user) => $this->formatUser($user))
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['nullable', 'string', 'max:50'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'] ?? 'admin',
        ]);

        return response()->json($this->formatUser($user), 201);
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['nullable', 'string', 'max:50'],
        ]);

        $user->fill(collect($data)->only(['name', 'email', 'role'])->filter(fn ($v) => $v !== null)->all());

        $newToken = null;

        if (! empty($data['password'])) {
            $user->password = $data['password'];

            if ($request->user()?->id === $user->id) {
                $newToken = Str::random(80);
                $user->api_token = hash('sha256', $newToken);
            } else {
                $user->api_token = null;
            }
        }

        $user->save();

        $response = $this->formatUser($user->fresh());

        if ($newToken) {
            $response['access_token'] = $newToken;
        }

        return response()->json($response);
    }

    public function destroy(Request $request, int $id)
    {
        abort_if($request->user()?->id === $id, 422, 'Non puoi eliminare il tuo account.');

        User::findOrFail($id)->delete();

        return response()->json(['ok' => true]);
    }

    private function formatUser(User $user): array
    {
        return $user->only(['id', 'name', 'email', 'role', 'created_at', 'updated_at']);
    }
}
