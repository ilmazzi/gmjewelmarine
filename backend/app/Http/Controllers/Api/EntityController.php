<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoatModel;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Inquiry;
use App\Models\Listing;
use App\Models\News;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EntityController extends Controller
{
    private const ENTITIES = [
        'Brand' => Brand::class,
        'Category' => Category::class,
        'Inquiry' => Inquiry::class,
        'Listing' => Listing::class,
        'Model' => BoatModel::class,
        'News' => News::class,
        'SiteSettings' => SiteSetting::class,
    ];

    public function index(Request $request, string $entity)
    {
        $modelClass = $this->modelClass($entity);
        $query = $modelClass::query();

        foreach ($this->filters($request) as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $query->where($this->column($key), $value);
        }

        foreach ($this->sorts($entity, $request->query('sort')) as [$column, $direction]) {
            $query->orderBy($column, $direction);
        }

        $limit = min((int) $request->query('limit', 300), 500);

        return response()->json($query->limit($limit)->get());
    }

    public function show(string $entity, int|string $id)
    {
        $modelClass = $this->modelClass($entity);

        return response()->json($modelClass::findOrFail($id));
    }

    public function store(Request $request, string $entity)
    {
        $modelClass = $this->modelClass($entity);

        if ($entity !== 'Inquiry') {
            $this->requireUser($request);
        }

        /** @var Model $model */
        $model = $modelClass::create($this->payload($request));

        return response()->json($model, 201);
    }

    public function update(Request $request, string $entity, int|string $id)
    {
        $this->requireUser($request);

        $modelClass = $this->modelClass($entity);
        $model = $modelClass::findOrFail($id);
        $model->update($this->payload($request));

        return response()->json($model->fresh());
    }

    public function destroy(Request $request, string $entity, int|string $id)
    {
        $this->requireUser($request);

        $modelClass = $this->modelClass($entity);
        $modelClass::findOrFail($id)->delete();

        return response()->json(['ok' => true]);
    }

    private function modelClass(string $entity): string
    {
        abort_unless(isset(self::ENTITIES[$entity]), 404, "Unknown entity [{$entity}].");

        return self::ENTITIES[$entity];
    }

    private function filters(Request $request): array
    {
        $filters = [];

        if ($request->filled('q')) {
            $decoded = json_decode((string) $request->query('q'), true);
            if (is_array($decoded)) {
                $filters = $decoded;
            }
        }

        foreach ($request->query() as $key => $value) {
            if (! in_array($key, ['q', 'sort', 'limit'], true)) {
                $filters[$key] = $value;
            }
        }

        return $filters;
    }

    private function sorts(string $entity, ?string $sort): array
    {
        if (! $sort) {
            return in_array($entity, ['Inquiry', 'SiteSettings'], true)
                ? [['id', 'desc']]
                : [['sort_order', 'asc'], ['id', 'desc']];
        }

        return collect(explode(',', $sort))
            ->map(function (string $part) {
                $part = trim($part);
                $direction = Str::startsWith($part, '-') ? 'desc' : 'asc';
                $column = ltrim($part, '-');

                return [$this->column($column), $direction];
            })
            ->all();
    }

    private function column(string $column): string
    {
        return $column === 'created_date' ? 'created_at' : $column;
    }

    private function payload(Request $request): array
    {
        return $request->except(['id', 'created_at', 'updated_at', 'created_date']);
    }

    private function requireUser(Request $request): User
    {
        $token = $request->bearerToken();
        $user = $token ? User::where('api_token', hash('sha256', $token))->first() : null;

        abort_unless($user, 401, 'Unauthenticated.');

        return $user;
    }
}
